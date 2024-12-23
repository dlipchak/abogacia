using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using System.Threading.Tasks;
using System;
using System.IO;

public class CompressedFileMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IWebHostEnvironment _env;

    public CompressedFileMiddleware(RequestDelegate next, IWebHostEnvironment env)
    {
        _next = next;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value;

        // Handle .js and .css files
        if (!path.EndsWith(".js", StringComparison.OrdinalIgnoreCase) &&
            !path.EndsWith(".css", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        // Check if browser supports compression
        var acceptEncoding = context.Request.Headers["Accept-Encoding"].ToString().ToLower();
        var originalPath = Path.Combine(_env.WebRootPath, path.TrimStart('/'));

        // Set content type based on file extension
        var contentType = path.EndsWith(".js", StringComparison.OrdinalIgnoreCase)
            ? "application/javascript"
            : "text/css";

        // Try Brotli
        if (acceptEncoding.Contains("br") && File.Exists(originalPath + ".br"))
        {
            context.Response.Headers["Content-Encoding"] = "br";
            context.Response.Headers["Content-Type"] = contentType;
            await context.Response.SendFileAsync(originalPath + ".br");
            return;
        }

        // Try Gzip
        if (acceptEncoding.Contains("gzip") && File.Exists(originalPath + ".gz"))
        {
            context.Response.Headers["Content-Encoding"] = "gzip";
            context.Response.Headers["Content-Type"] = contentType;
            await context.Response.SendFileAsync(originalPath + ".gz");
            return;
        }

        // Fall back to original file
        await _next(context);
    }
}

// Extension method to make it easier to add the middleware
public static class CompressedFileMiddlewareExtensions
{
    public static IApplicationBuilder UseCompressedFiles(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<CompressedFileMiddleware>();
    }
}