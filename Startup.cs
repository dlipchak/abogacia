using System;
using System.Collections.Generic;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Westwind.AspNetCore.LiveReload;
using System.Globalization;
using Microsoft.AspNetCore.Localization;

namespace AbogaciaCore
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>();

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // LiveReload for development purposes
            services.AddLiveReload(config =>
            {
                // Optional configuration for LiveReload
                // Example: config.LiveReloadEnabled = true;
            });

            // Add HttpClient for making HTTP requests
            services.AddHttpClient();

            // Configure Cookie Policies
            services.Configure<CookiePolicyOptions>(options =>
            {
                // Determine whether user consent is needed for non-essential cookies
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });

            // Add Razor Pages and MVC with runtime compilation
            services.AddControllersWithViews();
            services.AddRazorPages().AddRazorRuntimeCompilation();
            services.AddMvc(option => option.EnableEndpointRouting = false).AddRazorRuntimeCompilation();

            // Add Response Compression for dynamic content only
            services.AddResponseCompression(options =>
            {
                options.EnableForHttps = true; // Enable compression for HTTPS
                options.MimeTypes = new[] // Compress only dynamic MIME types
                {
            "text/html",               // HTML responses
            "application/json",        // JSON responses
            "text/plain",              // Plain text responses
            "application/xml",         // XML responses
            "text/xml"                 // Text-based XML responses
                };
            });

            // Configure Brotli Compression for dynamic responses
            services.Configure<BrotliCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Optimal; // Optimal compression for Brotli
            });

            // Configure Gzip Compression for dynamic responses
            services.Configure<GzipCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Optimal; // Optimal compression for Gzip
            });

            // Add static file extension mappings (if necessary)
            services.Configure<Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider>(options =>
            {
                options.Mappings[".avif"] = "image/avif"; // Support for AVIF image format
            });

            // Add Response Caching to optimize dynamic content delivery
            services.AddResponseCaching();

            services.AddHttpContextAccessor();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, IHttpContextAccessor httpContextAccessor)
        {
            if (env.IsDevelopment())
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
            provider.Mappings[".br"] = "application/x-brotli"; // Explicit MIME type for Brotli
            provider.Mappings[".gz"] = "application/gzip"; // Explicit MIME type for Gzip

            app.UseCompressedFiles();
            app.UseStaticFiles(new StaticFileOptions
            {
                ContentTypeProvider = provider,
                ServeUnknownFileTypes = true, // Ensure unknown types like .br can be served
                OnPrepareResponse = ctx =>
                {
                    var path = ctx.File.PhysicalPath;
                    var headers = ctx.Context.Response.Headers;

                    if (path.EndsWith(".br"))
                    {
                        headers["Content-Encoding"] = "br";
                        headers["Content-Type"] = "text/css"; // Ensure correct MIME type
                    }
                    else if (path.EndsWith(".gz"))
                    {
                        headers["Content-Encoding"] = "gzip";
                        headers["Content-Type"] = "text/css";
                    }

                    if (!env.IsDevelopment())
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

            VersionedFileHelper.Configure(app.ApplicationServices.GetRequiredService<IHttpContextAccessor>());

            var accessor = app.ApplicationServices.GetRequiredService<IHttpContextAccessor>();
            AssetHelper.Configure(accessor);
        }

    }
}
