using System;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Services;
using System.Diagnostics;
using System.Net.Mail;
using System.Net;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;

namespace AbogaciaCore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly IContentService _contentService;
        private readonly IUmbracoContextAccessor _umbracoContextAccessor;

        public CommentsController(IContentService contentService, IUmbracoContextAccessor umbracoContextAccessor)
        {
            _contentService = contentService;
            _umbracoContextAccessor = umbracoContextAccessor;
        }

        [HttpPost("submit")]
        public async Task<IActionResult> Submit([FromBody] CommentModel model)
        {
            try
            {
                // Debug information
                Debug.WriteLine($"Received comment submission:");
                Debug.WriteLine($"ArticleId: {model.ArticleId}");
                Debug.WriteLine($"Name: {model.Name}");
                Debug.WriteLine($"Email: {model.Email}");
                Debug.WriteLine($"Comment: {model.Comment}");
                Debug.WriteLine($"ParentCommentId: {model.ParentCommentId}");

                // Validate required fields
                if (model.ArticleId == 0)
                {
                    return BadRequest("ArticleId is required");
                }

                if (string.IsNullOrEmpty(model.Name))
                {
                    return BadRequest("Name is required");
                }

                if (string.IsNullOrEmpty(model.Email))
                {
                    return BadRequest("Email is required");
                }

                if (string.IsNullOrEmpty(model.Comment))
                {
                    return BadRequest("Comment is required");
                }

                // Get the article
                var article = _contentService.GetById(model.ArticleId);
                if (article == null)
                {
                    return BadRequest($"Article not found with ID: {model.ArticleId}");
                }

                // Determine parent node (article or parent comment)
                int parentId;
                if (!string.IsNullOrWhiteSpace(model.ParentCommentId))
                {
                    if (!int.TryParse(model.ParentCommentId, out parentId))
                    {
                        return BadRequest("Invalid ParentCommentId format");
                    }

                    var parentComment = _contentService.GetById(parentId);
                    if (parentComment == null)
                    {
                        return BadRequest($"Parent comment not found with ID: {parentId}");
                    }
                }
                else
                {
                    parentId = article.Id;
                }

                // Create a new comment
                var comment = _contentService.Create($"Comentario de {model.Name}", parentId, "comment");

                // Set the properties
                comment.SetValue("userName", model.Name);
                comment.SetValue("email", model.Email);
                comment.SetValue("userComment", model.Comment);
                comment.SetValue("isApproved", false); // Requires admin approval

                // Save the comment
                _contentService.Save(comment);

                // Send email notification after comment is created
                try
                {
                    var umbracoUrl = $"https://estudiolopezgiacomelli.com.ar/umbraco/section/content/workspace/document/edit/{comment.Key}/invariant/view/content";
                    
                    // Get the actual article URL
                    string articleUrl = "https://estudiolopezgiacomelli.com.ar";
                    if (_umbracoContextAccessor.TryGetUmbracoContext(out var context))
                    {
                        var publishedArticle = context.Content.GetById(article.Id);
                        if (publishedArticle != null)
                        {
                            articleUrl = $"https://estudiolopezgiacomelli.com.ar{publishedArticle.Url()}";
                        }
                    }
                    
                    await SendCommentNotificationEmail(model.Name, model.Email, model.Comment, article.Name, articleUrl, umbracoUrl);
                }
                catch (Exception emailEx)
                {
                    Debug.WriteLine($"Error sending email notification: {emailEx.Message}");
                    // Don't fail the comment submission if email fails
                }

                return Ok(new { message = "Comentario enviado correctamente. Será revisado antes de ser publicado." });
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error in comment submission: {ex.Message}");
                Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest($"Error: {ex.Message}");
            }
        }

        private async Task SendCommentNotificationEmail(string commenterName, string commenterEmail, string comment, string articleTitle, string articleUrl, string umbracoUrl)
        {
            var subject = $"Nuevo comentario en: {articleTitle}";
            var body = $@"
                <h3>Nuevo comentario recibido</h3>
                <p><b>Artículo:</b> <a href=""{articleUrl}"">{articleTitle}</a></p>
                <p><b>Nombre:</b> {commenterName}</p>
                <p><b>Email:</b> <a href=""mailto:{commenterEmail}"">{commenterEmail}</a></p>
                <p><b>Comentario:</b></p>
                <div style=""background-color: #f5f5f5; padding: 15px; border: 1px solid #ddd; margin: 10px 0;"">
                    {comment}
                </div>
                <p><a href=""{umbracoUrl}"" target=""_blank"">Revisar comentario en Umbraco</a></p>
            ";

            var message = new MailMessage();
            message.To.Add(new MailAddress("contacto@estudiolopezgiacomelli.com.ar"));
            message.Bcc.Add(new MailAddress("daniel.lipchak7603@gmail.com"));
            message.From = new MailAddress("daniel.lipchak7603@gmail.com");
            message.Subject = subject;
            message.Body = body;
            message.IsBodyHtml = true;

            using var smtp = new SmtpClient();
            var credential = new NetworkCredential
            {
                UserName = "daniel.lipchak7603@gmail.com",
                Password = "zpvb vkdl bvgi pzlb"
            };
            smtp.Credentials = credential;
            smtp.Host = "smtp.gmail.com";
            smtp.Port = 587;
            smtp.EnableSsl = true;
            smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
            await smtp.SendMailAsync(message);
        }
    }

    public class CommentModel
    {
        public int ArticleId { get; set; }
        public string ParentCommentId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Comment { get; set; }
    }
}