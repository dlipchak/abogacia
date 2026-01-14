using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;

namespace AbogaciaCore.Controllers
{
    [ApiController]
    [Route("umbraco/api/[controller]")]
    public class BlogViewsReportController : Controller
    {
        private readonly IContentService _contentService;
        private readonly IContentTypeService _contentTypeService;
        private readonly IUmbracoContextAccessor _umbracoContextAccessor;

        public BlogViewsReportController(
            IContentService contentService,
            IContentTypeService contentTypeService,
            IUmbracoContextAccessor umbracoContextAccessor)
        {
            _contentService = contentService;
            _contentTypeService = contentTypeService;
            _umbracoContextAccessor = umbracoContextAccessor;
        }

        [HttpGet("GetBlogEntries")]
        public IActionResult GetBlogEntries()
        {
            try
            {
                var blogEntryType = _contentTypeService.Get("blogEntry");
                if (blogEntryType == null)
                {
                    return Ok(new { success = true, data = new List<object>() });
                }

                // Get all content of blogEntry type
                var allContent = _contentService.GetPagedOfType(
                    blogEntryType.Id, 
                    0, 
                    int.MaxValue, 
                    out long totalRecords, 
                    null, 
                    null);
                
                // Helper to get published content
                Umbraco.Cms.Core.Models.PublishedContent.IPublishedContent? GetPublishedContent(IContent content)
                {
                    if (!_umbracoContextAccessor.TryGetUmbracoContext(out var context))
                        return null;
                    return context.Content?.GetById(content.Id);
                }

                // Get published content cache for URLs
                string? GetContentUrl(Umbraco.Cms.Core.Models.PublishedContent.IPublishedContent? publishedContent)
                {
                    return publishedContent?.Url();
                }

                // Get category (parent) name from published content
                string? GetCategoryName(Umbraco.Cms.Core.Models.PublishedContent.IPublishedContent? publishedContent)
                {
                    return publishedContent?.Parent?.Name;
                }

                // Get ALL comments for an article (including unpublished)
                List<object> GetComments(int articleId)
                {
                    var children = _contentService.GetPagedChildren(articleId, 0, int.MaxValue, out long total);
                    
                    return children
                        .Where(x => x.ContentType.Alias == "comment")
                        .OrderByDescending(x => x.CreateDate)
                        .Select(comment => new
                        {
                            id = comment.Id,
                            key = comment.Key.ToString(),
                            userName = comment.GetValue<string>("userName") ?? "Anónimo",
                            email = comment.GetValue<string>("email") ?? "",
                            userComment = comment.GetValue<string>("userComment") ?? "",
                            isApproved = comment.GetValue<bool>("isApproved"),
                            isPublished = comment.Published,
                            createDate = comment.CreateDate,
                            updateDate = comment.UpdateDate
                        })
                        .Cast<object>()
                        .ToList();
                }
                
                var blogEntries = allContent
                    .Where(c => c.Published)
                    .Select(c => {
                        var published = GetPublishedContent(c);
                        var comments = GetComments(c.Id);
                        return new
                        {
                            id = c.Id,
                            key = c.Key.ToString(),
                            name = c.Name,
                            category = GetCategoryName(published),
                            viewCount = c.GetValue<int>("viewCount"),
                            commentCount = comments.Count,
                            comments = comments,
                            createDate = c.CreateDate,
                            updateDate = c.UpdateDate,
                            url = GetContentUrl(published)
                        };
                    })
                    .OrderByDescending(x => x.viewCount)
                    .ToList();

                return Ok(new { success = true, data = blogEntries, total = blogEntries.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}

