using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Models;

namespace AbogaciaCore.Services
{
    public class ViewCountService
    {
        private readonly IContentService _contentService;

        public ViewCountService(IContentService contentService)
        {
            _contentService = contentService;
        }

        public void IncrementViewCount(int nodeId)
        {
            var content = _contentService.GetById(nodeId);
            if (content == null) return;

            var currentCount = content.GetValue<int>("viewCount");
            content.SetValue("viewCount", currentCount + 1);
            _contentService.Save(content);
            _contentService.Publish(content, ["*"], 0);
        }
    }
}