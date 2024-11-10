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
using Westwind.AspnetCore.LiveReload;
using Westwind.AspNetCore.LiveReload;

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
            services.AddLiveReload(config =>
            {
                // optional - use config instead
                //config.LiveReloadEnabled = true;
                //config.FolderToMonitor = Path.GetFullname(Path.Combine(Env.ContentRootPath,"..")) ;
            });

            services.AddHttpClient();

            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });
            services.AddControllersWithViews();
            services.AddRazorPages().AddRazorRuntimeCompilation();
            services.AddMvc(option => option.EnableEndpointRouting = false).AddRazorRuntimeCompilation();

            // Add Response Compression
            services.AddResponseCompression(options =>
            {
                options.EnableForHttps = true; // Enable gzip for HTTPS requests
                options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
                {
            "text/css",
            "application/javascript",
            "font/woff",
            "font/woff2",
            "application/font-woff",
            "application/font-woff2",
            "application/x-font-ttf",
            "application/x-font-opentype",
            "image/svg+xml"
                });
            });

            // Optional: Adjust compression level for fonts (default is Optimal)
            services.Configure<BrotliCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Fastest; // You may change to Optimal or SmallestSize
            });

            services.Configure<GzipCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Optimal;
            });
            services.Configure<Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider>(options =>
            {
                options.Mappings[".avif"] = "image/avif";
            });

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
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

            // Use StaticFiles for everything except .jpg and .jpeg images
            var provider = new FileExtensionContentTypeProvider();
            provider.Mappings[".avif"] = "image/avif";

            app.UseStaticFiles(new StaticFileOptions
            {
                ContentTypeProvider = provider
            });

            // Place ImageFormatMiddleware after UseStaticFiles
            // app.UseMiddleware<ImageFormatMiddleware>();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }

    }
}
