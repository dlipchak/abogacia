using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Microsoft.AspNetCore.Http;

public static class VersionedFileHelper
{
    private static Dictionary<string, string> _manifestContent;
    private static IHttpContextAccessor _httpContextAccessor;

    // Method to initialize IHttpContextAccessor (called during app startup)
    public static void Configure(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public static string GetVersionedFile(string fileName)
    {
        _manifestContent ??= LoadManifest();

        if (!_manifestContent.TryGetValue(fileName, out var versionedFile))
        {
            return "/dist/" + fileName; // Fallback to non-versioned file
        }

        // Get HttpContext from IHttpContextAccessor
        var httpContext = _httpContextAccessor?.HttpContext;
        if (httpContext == null)
        {
            return "/dist/" + versionedFile; // Fallback to uncompressed version
        }

        // Check if the client supports Brotli or Gzip
        var acceptEncoding = httpContext.Request.Headers["Accept-Encoding"].ToString();
        if (acceptEncoding.Contains("br"))
        {
            return "/dist/" + versionedFile + ".br"; // Return Brotli version
        }
        else if (acceptEncoding.Contains("gzip"))
        {
            return "/dist/" + versionedFile + ".gz"; // Return Gzip version
        }

        return "/dist/" + versionedFile; // Return uncompressed version
    }

    private static Dictionary<string, string> LoadManifest()
    {
        var manifestPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "rev-manifest.json");
        return File.Exists(manifestPath)
            ? JsonSerializer.Deserialize<Dictionary<string, string>>(File.ReadAllText(manifestPath))
            : new Dictionary<string, string>();
    }
}
