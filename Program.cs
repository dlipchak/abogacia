using System.Globalization;
using System.IO.Compression;
using System.Collections.Generic;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using AbogaciaCore;
using AbogaciaCore.Helpers;
using Westwind.AspNetCore.LiveReload;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddLiveReload(config =>
{
    // Optional configuration for LiveReload
});

builder.Services.AddHttpClient();

// Configure Cookie Policies
builder.Services.Configure<CookiePolicyOptions>(options =>
{
    options.CheckConsentNeeded = context => true;
    options.MinimumSameSitePolicy = SameSiteMode.None;
});

// Add Razor Pages and MVC with runtime compilation
builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages().AddRazorRuntimeCompilation();
builder.Services.AddMvc(option => option.EnableEndpointRouting = false).AddRazorRuntimeCompilation();

// Add Response Compression for dynamic content only
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.MimeTypes = new[]
    {
        "text/html",
        "application/json",
        "text/plain",
        "application/xml",
        "text/xml"
    };
});

// Configure Brotli Compression
builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Optimal;
});

// Configure Gzip Compression
builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Optimal;
});

// Add static file extension mappings
builder.Services.Configure<FileExtensionContentTypeProvider>(options =>
{
    options.Mappings[".avif"] = "image/avif";
});

// Add Response Caching
builder.Services.AddResponseCaching();
builder.Services.AddHttpContextAccessor();

// Configure Kestrel
builder.WebHost.ConfigureKestrel((context, options) =>
{
    if (context.HostingEnvironment.IsDevelopment())
    {
        options.ListenAnyIP(5001, listenOptions =>
        {
            listenOptions.UseHttps();
            listenOptions.Protocols = HttpProtocols.Http2;
        });

        options.ListenAnyIP(5000, listenOptions =>
        {
            listenOptions.Protocols = HttpProtocols.Http1AndHttp2;
        });
    }
    else
    {
        options.ConfigureEndpointDefaults(listenOptions =>
        {
            listenOptions.Protocols = HttpProtocols.Http1AndHttp2;
        });
    }
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseLiveReload();
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseResponseCompression();
app.UseCookiePolicy();

// Use StaticFiles with custom configurations
var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".avif"] = "image/avif";
provider.Mappings[".br"] = "application/x-brotli";
provider.Mappings[".gz"] = "application/gzip";

app.UseCompressedFiles();
app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = provider,
    ServeUnknownFileTypes = true,
    OnPrepareResponse = ctx =>
    {
        var path = ctx.File.PhysicalPath;
        var headers = ctx.Context.Response.Headers;

        if (path.EndsWith(".br"))
        {
            headers["Content-Encoding"] = "br";
            headers["Content-Type"] = "text/css";
        }
        else if (path.EndsWith(".gz"))
        {
            headers["Content-Encoding"] = "gzip";
            headers["Content-Type"] = "text/css";
        }

        if (!app.Environment.IsDevelopment())
        {
            headers.Append("Cache-Control", "public,max-age=31536000");
        }
        else
        {
            headers.Append("Cache-Control", "no-cache, no-store");
            headers.Append("Pragma", "no-cache");
            headers.Append("Expires", "-1");
        }
    }
});

// Middleware to redirect /servicios/* to /guias/*
app.Use(async (context, next) =>
{
    var requestPath = context.Request.Path.Value?.ToLower();

    if (requestPath?.StartsWith("/servicios/") == true)
    {
        var newPath = requestPath.Replace("/servicios/", "/guias/");
        context.Response.StatusCode = 301;
        context.Response.Headers["Location"] = newPath;
        return;
    }

    await next();
});

// Use MVC with default route
app.UseMvc(routes =>
{
    routes.MapRoute(
        name: "default",
        template: "{controller=Home}/{action=Index}/{id?}"
    );
});

// Enable response caching
app.UseResponseCaching();

// Localization configuration
app.UseRequestLocalization(new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture("es-ES"),
    SupportedCultures = new List<CultureInfo> { new CultureInfo("es-ES") },
    SupportedUICultures = new List<CultureInfo> { new CultureInfo("es-ES") }
});

var accessor = app.Services.GetRequiredService<IHttpContextAccessor>();
VersionedFileHelper.Configure(accessor);
AssetHelper.Configure(accessor);

app.Run();
