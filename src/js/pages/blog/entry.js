import "@scss/pages/blog.scss";

// Scripts
import "@js/common";
import "./comments.js";

// Handle reply links
document.addEventListener("DOMContentLoaded", function() {
  const replyLinks = document.querySelectorAll(".comment-reply-link");
  replyLinks.forEach((link) => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const respondDiv = document.getElementById("respond");
      const commentForm = document.getElementById("commentform");
      const parentCommentId = link.getAttribute("data-comment-id");

      // Update form title to indicate reply
      const formTitle = respondDiv.querySelector("h3");
      formTitle.innerHTML = "Responder al <span>Comentario</span>";

      // Set the parent comment ID
      document.getElementById("parentCommentId").value = parentCommentId;

      // Scroll to form
      respondDiv.scrollIntoView({ behavior: "smooth" });

      // Focus on the comment textarea
      setTimeout(() => {
        commentForm.querySelector("textarea[name='Comment']").focus();
      }, 500);
    });
  });
});
