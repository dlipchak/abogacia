using Microsoft.AspNetCore.Mvc;

[Route("error")]
public class ErrorController : Controller
{
    // GET /error/404, /error/500, etc.
    [HttpGet("{statusCode}")]
    public IActionResult Index(int statusCode)
    {
        if (statusCode == 404)
        {
            // Option A: Return a simple “NotFound” view
            return View("Error");

            // Option B: If you want to fetch a published “404” node from Umbraco 
            // and render it with your normal template logic, you could do something
            // advanced like use the Umbraco APIs to grab that content and pass it
            // into a view. For quickness, a static view is simplest.
        }

        // Fallback for other codes (500, etc.)
        return View("Error");
    }
}
