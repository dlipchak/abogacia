using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Umbraco.Cms.Core.Web;
using AbogaciaCore.Services;
using Umbraco.Cms.Web.Common.Controllers;
using Microsoft.AspNetCore.Mvc;

public class BlogEntryController : RenderController
{
    private readonly ViewCountService _viewCountService;

    public BlogEntryController(
        ILogger<BlogEntryController> logger,
        ICompositeViewEngine compositeViewEngine,
        IUmbracoContextAccessor umbracoContextAccessor,
        ViewCountService viewCountService)
        : base(logger, compositeViewEngine, umbracoContextAccessor)
    {
        _viewCountService = viewCountService;
    }

    public override IActionResult Index()
    {
        _viewCountService.IncrementViewCount(CurrentPage.Id);
        return CurrentTemplate(CurrentPage);
    }
}