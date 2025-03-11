using Microsoft.AspNetCore.Http;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using System.Text.RegularExpressions;

namespace AbogaciaCore.Middleware
{
    public class ResponsiveImageMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IWebHostEnvironment _env;
        private static readonly Regex _imagePathPattern = new(@"^/images/.*?_(\d+)w\.(webp|jpg|jpeg|png)$", RegexOptions.Compiled | RegexOptions.IgnoreCase);

        public ResponsiveImageMiddleware(RequestDelegate next, IWebHostEnvironment env)
        {
            _next = next;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value;
            var width = 0;
            var originalPath = "";

            // Only support the new format with width suffix
            var match = _imagePathPattern.Match(path ?? "");
            if (!match.Success)
            {
                await _next(context);
                return;
            }

            width = int.Parse(match.Groups[1].Value);
            originalPath = Regex.Replace(path!, $"_{width}w\\.", ".");

            try
            {
                var originalFullPath = Path.Combine(_env.WebRootPath, originalPath.TrimStart('/'));
                var resizedFullPath = Path.Combine(_env.WebRootPath, path!.TrimStart('/'));

                // Create the directory if it doesn't exist
                var directory = Path.GetDirectoryName(resizedFullPath)!;
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                // If resized image doesn't exist but original does, create it
                if (!File.Exists(resizedFullPath) && File.Exists(originalFullPath))
                {
                    using var image = await Image.LoadAsync(originalFullPath);

                    // Only resize if requested width is smaller than original
                    if (width < image.Width)
                    {
                        var aspectRatio = (float)image.Height / image.Width;
                        var height = (int)(width * aspectRatio);
                        image.Mutate(x => x.Resize(width, height));
                    }

                    await image.SaveAsync(resizedFullPath);
                }
                else if (!File.Exists(originalFullPath))
                {
                    context.Response.StatusCode = 404;
                    await context.Response.WriteAsync($"Original image not found: {originalPath}");
                    return;
                }
            }
            catch (Exception ex)
            {
                context.Response.StatusCode = 500;
                await context.Response.WriteAsync($"Error processing image: {ex.Message}");
                return;
            }

            // Let the static files middleware handle serving the file
            await _next(context);
        }
    }

    public static class ResponsiveImageMiddlewareExtensions
    {
        public static IApplicationBuilder UseResponsiveImages(this IApplicationBuilder app)
        {
            return app.UseMiddleware<ResponsiveImageMiddleware>();
        }
    }
}