using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Umbraco.Cms.Core.DependencyInjection;               // IUmbracoBuilder
using Umbraco.Extensions;
using Umbraco.Cms.Persistence.Sqlite;
using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using System.Linq;
using Microsoft.AspNetCore.Localization;
using System.Collections.Generic;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using Westwind.AspNetCore.LiveReload;
using System;
using System.IO;           // for AddUmbracoEFCoreSqlite()

var builder = WebApplication.CreateBuilder(args);

Console.WriteLine(Directory.GetCurrentDirectory());

// Build the Umbraco pipeline with EFCore + SQLite
builder.Services.AddUmbraco(builder.Environment, builder.Configuration)
    .AddBackOffice()
    .AddWebsite()
    .AddComposers()
    .AddUmbracoSqliteSupport() // <-- EF Core SQLite support
    .Build();

// --------------------------------------------------
// SERVICE REGISTRATIONS
// --------------------------------------------------
builder.Services.AddLiveReload();
builder.Services.AddHttpClient();

builder.Services.Configure<CookiePolicyOptions>(options =>
{
    options.CheckConsentNeeded = context => true;
    options.MinimumSameSitePolicy = SameSiteMode.None;
});

// Traditional controllers + Razor Pages
builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages().AddRazorRuntimeCompilation();

// Response compression
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
builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Optimal;
});
builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Optimal;
});

// Static file mappings
builder.Services.Configure<FileExtensionContentTypeProvider>(options =>
{
    options.Mappings[".avif"] = "image/avif";
});

// Response caching + HttpContext accessor
builder.Services.AddResponseCaching();
builder.Services.AddHttpContextAccessor();

// --------------------------------------------------
// KESTREL CONFIG
// --------------------------------------------------
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

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});

var app = builder.Build();

// --------------------------------------------------
// BOOT UMBRACO
// --------------------------------------------------
await app.BootUmbracoAsync();

// --------------------------------------------------
// MIDDLEWARE PIPELINE
// --------------------------------------------------
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

// Serve static files (including .br, .gz, etc.)
var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".avif"] = "image/avif";
provider.Mappings[".br"] = "application/x-brotli";
provider.Mappings[".gz"] = "application/gzip";

// If you have a custom extension for pre-compressed files:
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

app.UseResponseCaching();

// Localization
app.UseRequestLocalization(new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture("es-ES"),
    SupportedCultures = new List<CultureInfo> { new CultureInfo("es-ES") },
    SupportedUICultures = new List<CultureInfo> { new CultureInfo("es-ES") }
});

// Example custom redirect from /servicios/* to /guias/*
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

// Configure accessors
var accessor = app.Services.GetRequiredService<IHttpContextAccessor>();
VersionedFileHelper.Configure(accessor);
AssetHelper.Configure(accessor);

// --------------------------------------------------
// ROUTING
// --------------------------------------------------
app.UseRouting();

// --------------------------------------------------
// UMBRACO MIDDLEWARE
// --------------------------------------------------
app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.UseInstallerEndpoints();
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });

// --------------------------------------------------
// ADD YOUR OWN CONTROLLER ROUTES
// --------------------------------------------------
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllerRoute(
        name: "default",
        pattern: "{controller=Home}/{action=Index}/{id?}"
    );

    endpoints.MapRazorPages();
});

// Add CORS middleware
app.UseCors("AllowAll");

// --------------------------------------------------
// RUN
// --------------------------------------------------
app.Run();
