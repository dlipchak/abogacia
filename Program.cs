using System;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Server.Kestrel.Core;

namespace AbogaciaCore
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();

                    webBuilder.ConfigureKestrel((context, options) =>
                    {
                        if (context.HostingEnvironment.IsDevelopment())
                        {
                            // Development: Enable HTTP/2 and HTTPS for localhost
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
                            // Production: Allow Baehost to manage ports (no hardcoding)
                            options.ConfigureEndpointDefaults(listenOptions =>
                            {
                                listenOptions.Protocols = HttpProtocols.Http1AndHttp2;
                            });
                        }
                    });
                });
    }
}
