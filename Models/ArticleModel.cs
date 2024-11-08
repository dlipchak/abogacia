using System;

namespace AbogaciaCore.Models
{

    public enum ArticleCategory
    {
        TrafficAccident,
        WorkAccident,
        Dismissals
    }
    public class ArticleModel
    {
        public string Article { get; set; }
        public string ArticleName { get; set; }
        public string ArticleCategory { get; set; }
        public string ImageName { get; set; }

    }
}