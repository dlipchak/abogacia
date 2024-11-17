using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Diagnostics;

public static class VersionedFileHelper
{
    private static Dictionary<string, string> _manifestContent;
    
    public static string GetVersionedFile(string fileName)
    {
        _manifestContent ??= LoadManifest();
        
        var lookupPath = $"wwwroot/{fileName.TrimStart('~', '/')}";
        
        return _manifestContent.TryGetValue(lookupPath, out var versionedFile)
            ? $"/{versionedFile.Replace("wwwroot/", "")}"
            : $"/{fileName.TrimStart('~', '/')}";
    }
    
    private static Dictionary<string, string> LoadManifest()
    {
        var manifestPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "rev-manifest.json");
        return File.Exists(manifestPath)
            ? JsonSerializer.Deserialize<Dictionary<string, string>>(File.ReadAllText(manifestPath))
            : new Dictionary<string, string>();
    }
} 