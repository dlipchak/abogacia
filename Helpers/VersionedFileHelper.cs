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
            return "/dist/" + fileName;
        }

        return "/dist/" + versionedFile;
    }

    private static Dictionary<string, string> LoadManifest()
    {
        var manifestPath = Path.Combine(Directory.GetCurrentDirectory(), "src", "rev-manifest.json");
        return File.Exists(manifestPath)
            ? JsonSerializer.Deserialize<Dictionary<string, string>>(File.ReadAllText(manifestPath))
            : new Dictionary<string, string>();
    }
}
