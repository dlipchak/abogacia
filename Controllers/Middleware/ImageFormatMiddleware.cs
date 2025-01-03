using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Threading.Tasks;

public class ImageFormatMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ImageFormatMiddleware> _logger;

    public ImageFormatMiddleware(RequestDelegate next, ILogger<ImageFormatMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value;

        // Check if the request is for a .jpg, .jpeg, or .webp file
        if (path.EndsWith(".jpg", System.StringComparison.OrdinalIgnoreCase) ||
            path.EndsWith(".jpeg", System.StringComparison.OrdinalIgnoreCase) ||
            path.EndsWith(".webp", System.StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation("Detected image request for path: {Path}", path);

            // Check if the client accepts WebP and the original request wasn't for WebP
            if (!path.EndsWith(".webp", System.StringComparison.OrdinalIgnoreCase) &&
                context.Request.Headers["Accept"].ToString().Contains("image/webp"))
            {
                // Construct the corresponding WebP path
                var webpFilePath = path
                    .Replace(".jpg", ".webp", System.StringComparison.OrdinalIgnoreCase)
                    .Replace(".jpeg", ".webp", System.StringComparison.OrdinalIgnoreCase);

                var physicalWebpPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", webpFilePath.TrimStart('/'));

                // Check if the WebP file exists on disk
                if (File.Exists(physicalWebpPath))
                {
                    _logger.LogInformation("WebP file found. Serving WebP file: {WebpPath}", webpFilePath);

                    // Serve the WebP file directly
                    context.Response.ContentType = "image/webp";
                    await context.Response.SendFileAsync(physicalWebpPath);
                    return;
                }
            }

            // Fallback to the original file
            var physicalOriginalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", path.TrimStart('/'));

            if (File.Exists(physicalOriginalPath))
            {
                _logger.LogInformation("Serving original file: {Path}", path);

                context.Response.ContentType = path.EndsWith(".webp", System.StringComparison.OrdinalIgnoreCase)
                    ? "image/webp"
                    : "image/jpeg";
                await context.Response.SendFileAsync(physicalOriginalPath);
                return;
            }
            else
            {
                _logger.LogWarning("File not found: {Path}", physicalOriginalPath);
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                return;
            }
        }

        // Continue to the next middleware if not an image request
        await _next(context);
    }
}
