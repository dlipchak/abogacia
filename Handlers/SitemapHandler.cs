using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Core.Models;
using Microsoft.AspNetCore.Hosting;
using System.Xml.Linq;

namespace AbogaciaCore.Handlers
{
    public class SitemapHandler :
        INotificationHandler<ContentPublishedNotification>,
        INotificationHandler<ContentUnpublishedNotification>,
        INotificationHandler<ContentMovedToRecycleBinNotification>
    {
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IUmbracoContextAccessor _umbracoContextAccessor;

        public SitemapHandler(
            IWebHostEnvironment webHostEnvironment,
            IUmbracoContextAccessor umbracoContextAccessor)
        {
            _webHostEnvironment = webHostEnvironment;
            _umbracoContextAccessor = umbracoContextAccessor;
        }

        public void Handle(ContentPublishedNotification notification)
        {
            try
            {
                var sitemapPath = Path.Combine(_webHostEnvironment.WebRootPath, "sitemap.xml");
                var sitemap = XDocument.Load(sitemapPath);
                var urlset = sitemap.Root;
                bool changed = false;

                if (_umbracoContextAccessor.TryGetUmbracoContext(out var context))
                {
                    foreach (var entity in notification.PublishedEntities.Where(x =>
                        x.ContentType.Alias == "blogEntry" ||
                        x.ContentType.Alias == "blogEntryCategory"))
                    {
                        var publishedContent = context.Content.GetById(entity.Id);
                        if (publishedContent == null) continue;

                        var url = $"https://estudiolopezgiacomelli.com.ar{publishedContent.Url()}";
                        var lastmod = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss+00:00");

                        var existingUrl = urlset.Elements("url")
                            .FirstOrDefault(x => x.Element("loc")?.Value == url);

                        if (existingUrl != null)
                        {
                            existingUrl.Element("lastmod").Value = lastmod;
                        }
                        else
                        {
                            urlset.Add(new XElement("url",
                                new XElement("loc", url),
                                new XElement("lastmod", lastmod),
                                new XElement("priority", entity.ContentType.Alias == "blogEntryCategory" ? "0.70" : "0.80"),
                                new XElement("changefreq", "weekly"),
                                new XComment($" entityId: {entity.Id} ")
                            ));
                        }
                        changed = true;
                    }
                }

                if (changed)
                {
                    sitemap.Save(sitemapPath);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in publish handler: {ex}");
            }
        }

        public void Handle(ContentUnpublishedNotification notification)
        {
            RemoveFromSitemap(notification.UnpublishedEntities);
        }

        public void Handle(ContentMovedToRecycleBinNotification notification)
        {
            RemoveFromSitemap(notification.MoveInfoCollection.Select(x => x.Entity));
        }

        private void RemoveFromSitemap(IEnumerable<IContent> entities)
        {
            try
            {
                if (!entities.Any(x => x.ContentType.Alias == "blogEntry" || x.ContentType.Alias == "blogEntryCategory"))
                    return;

                var sitemapPath = Path.Combine(_webHostEnvironment.WebRootPath, "sitemap.xml");
                var sitemap = XDocument.Load(sitemapPath);
                var urlset = sitemap.Root;
                bool changed = false;

                foreach (var entity in entities.Where(x =>
                    x.ContentType.Alias == "blogEntry" ||
                    x.ContentType.Alias == "blogEntryCategory"))
                {
                    var urlsToRemove = urlset.Elements("url")
                        .Where(x => x.Nodes()
                            .OfType<XComment>()
                            .Any(c => c.Value.Trim() == $"entityId: {entity.Id}"))
                        .ToList();

                    foreach (var urlElement in urlsToRemove)
                    {
                        urlElement.Remove();
                        changed = true;
                    }
                }

                if (changed)
                {
                    sitemap.Save(sitemapPath);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error removing from sitemap: {ex}");
            }
        }
    }
}