namespace AbogaciaCore.Models
{

    public class JsonLdModel
    {
        public string Headline { get; set; }
        public string Description { get; set; }
        public string Keywords { get; set; }
        public string ImageName { get; set; } // Pass the image name for the article
        public string Category { get; set; }
        public string ArticleBody { get; set; }
    }
}
