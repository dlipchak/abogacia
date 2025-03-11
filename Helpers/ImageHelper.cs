using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Text;
using System.Web;
using System.IO;

namespace AbogaciaCore.Helpers
{
    public static class ImageHelper
    {
        private static readonly int[] DefaultSizes = new[] { 320, 640, 960, 1280, 1920 };

        public static IHtmlContent ResponsiveImage(
            this IHtmlHelper html,
            string imagePath,
            string alt,
            string className = "",
            int[] sizes = null,
            string fetchPriority = null)
        {
            sizes ??= DefaultSizes;
            var sb = new StringBuilder();

            sb.Append($"<img");
            if (!string.IsNullOrEmpty(className))
            {
                sb.Append($" class=\"{className}\"");
            }

            // Get file extension and path without extension
            var extension = Path.GetExtension(imagePath);
            var pathWithoutExt = imagePath.Substring(0, imagePath.Length - extension.Length);

            // Generate srcset with static paths using 'w' suffix
            var srcset = string.Join(", ", sizes.Select(size =>
                $"{pathWithoutExt}_{size}w{extension} {size}w"));

            // Use the largest size as default src
            sb.Append($" src=\"{pathWithoutExt}_{sizes.Max()}w{extension}\"");
            sb.Append($" alt=\"{System.Web.HttpUtility.HtmlAttributeEncode(alt)}\"");
            sb.Append($" srcset=\"{srcset}\"");

            // Generate sizes attribute based on the available widths
            var sizesAttr = string.Join(", ", sizes.Select(size =>
                size == sizes.Max() ? $"{size}px" : $"(max-width: {size}px) {size}px"));
            sb.Append($" sizes=\"{sizesAttr}\"");

            if (!string.IsNullOrEmpty(fetchPriority))
            {
                sb.Append($" fetchpriority=\"{fetchPriority}\"");
            }

            sb.Append(" loading=\"lazy\"");
            sb.Append(">");

            return new HtmlString(sb.ToString());
        }
    }
}