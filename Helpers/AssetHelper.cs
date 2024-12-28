using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Microsoft.AspNetCore.Http;

public static class AssetHelper
{
    private static IHttpContextAccessor _httpContextAccessor;

    public static void Configure(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private static readonly Lazy<Dictionary<string, string>> UrlToEntryMap = new Lazy<Dictionary<string, string>>(() =>
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

        // Check if this is a novedades path
        if (path.StartsWith("/novedades"))
        {
            var segments = path.Split('/').Length;
            if (segments >= 4)
            {
                return new PageAssets { EntryName = "blogEntry" };
            }
            else if (segments == 3)
            {
                return new PageAssets { EntryName = "blogEntryCategory" };
            }
            else if (segments == 2)
            {
                return new PageAssets { EntryName = "blog" };
            }
        }

        if (!UrlToEntryMap.Value.TryGetValue(path, out var entryName))
        {
            return new PageAssets();
        }

        var assets = new PageAssets { EntryName = entryName };

        var viewportType = "desktop";
        var userAgent = _httpContextAccessor?.HttpContext?.Request.Headers["User-Agent"].ToString();
        if (userAgent?.Contains("Mobile") == true)
        {
            viewportType = "mobile";
        }
        else if (userAgent?.Contains("Tablet") == true)
        {
            viewportType = "tablet";
        }

        var criticalPath = Path.Combine(env.WebRootPath, "dist", "critical", $"{entryName}.{viewportType}.css");
        if (File.Exists(criticalPath))
        {
            assets.CriticalCss = File.ReadAllText(criticalPath);
        }

        return assets;
    }
}