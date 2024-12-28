using System;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Services;
using System.Diagnostics;

namespace AbogaciaCore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly IContentService _contentService;

        public CommentsController(IContentService contentService)
        {
            _contentService = contentService;
        }

        [HttpPost("submit")]
        public IActionResult Submit([FromBody] CommentModel model)
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

                return Ok(new { message = "Comentario enviado correctamente. Será revisado antes de ser publicado." });
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error in comment submission: {ex.Message}");
                Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest($"Error: {ex.Message}");
            }
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