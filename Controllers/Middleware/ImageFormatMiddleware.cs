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

        // Check if the request is for a .jpg or .jpeg file
        if (path.EndsWith(".jpg", System.StringComparison.OrdinalIgnoreCase) ||
            path.EndsWith(".jpeg", System.StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation("Detected image request for path: {Path}", path);

            // Check if the client accepts AVIF
            if (context.Request.Headers["Accept"].ToString().Contains("image/avif"))
            {
                // Construct the corresponding AVIF path
                var avifFilePath = path.Replace(".jpg", ".avif", System.StringComparison.OrdinalIgnoreCase)
                                       .Replace(".jpeg", ".avif", System.StringComparison.OrdinalIgnoreCase);

                var physicalAvifPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", avifFilePath.TrimStart('/'));

                // Check if the AVIF file exists on disk
                if (File.Exists(physicalAvifPath))
                {
                    _logger.LogInformation("AVIF file found. Serving AVIF file: {AvifPath}", avifFilePath);

                    // Serve the AVIF file directly
                    context.Response.ContentType = "image/avif";
                    await context.Response.SendFileAsync(physicalAvifPath);
                    return;
                }
            }

            // Fallback to the original .jpg/.jpeg file if AVIF is not available
            var physicalJpgPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", path.TrimStart('/'));

            if (File.Exists(physicalJpgPath))
            {
                _logger.LogInformation("Serving original JPEG file: {Path}", path);

                context.Response.ContentType = "image/jpeg";
                await context.Response.SendFileAsync(physicalJpgPath);
                return;
            }
            else
            {
                _logger.LogWarning("File not found: {Path}", physicalJpgPath);
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                return;
            }
        }

        // Continue to the next middleware if not an image request
        await _next(context);
    }
}
