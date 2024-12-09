using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

public static class AssetHelper
{
    private static readonly Lazy<Dictionary<string, string>> UrlToEntryMap = new(() =>
    {
        try
        {
            var mappingPath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot", "dist", "critical", "url-mapping.json"
            );
            var json = File.ReadAllText(mappingPath);
            return JsonSerializer.Deserialize<Dictionary<string, string>>(json) 
                   ?? new Dictionary<string, string>();
        }
        catch
        {
            return new Dictionary<string, string>();
        }
    });

    public class PageAssets
    {
        public string CriticalCss { get; set; } = string.Empty;
        public string EntryName { get; set; } = string.Empty;
        public string CssPath => !string.IsNullOrEmpty(EntryName) 
            ? VersionedFileHelper.GetVersionedFile($"{EntryName}.css")
            : string.Empty;
        public string JsPath => !string.IsNullOrEmpty(EntryName)
            ? VersionedFileHelper.GetVersionedFile($"{EntryName}.js")
            : string.Empty;
    }

    public static PageAssets GetAssetsForUrl(string currentUrl, IWebHostEnvironment env)
    {
        var path = currentUrl.Split('?')[0].TrimEnd('/');
        if (string.IsNullOrEmpty(path)) path = "/";

        if (!UrlToEntryMap.Value.TryGetValue(path, out var entryName))
        {
            return new PageAssets();
        }

        var criticalCssPath = Path.Combine(env.WebRootPath, "dist", "critical", $"{entryName}.css");
        var criticalCss = File.Exists(criticalCssPath) 
            ? File.ReadAllText(criticalCssPath) 
            : string.Empty;

        return new PageAssets
        {
            CriticalCss = criticalCss,
            EntryName = entryName
        };
    }
} 