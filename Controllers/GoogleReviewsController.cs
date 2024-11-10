using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System;
using System.IO;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class GoogleReviewsController : ControllerBase
{
    [HttpGet("get-reviews")]
    public async Task<IActionResult> GetGoogleReviews()
    {
        try
        {
            // Path to the manually created JSON file with reviews data
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "reviews.json");

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("Reviews data file not found.");
            }

            // Read the JSON file content
            var fileContent = await System.IO.File.ReadAllTextAsync(filePath);

            // Parse the file content as a JArray since it's an array at the root
            var reviewsArray = JArray.Parse(fileContent);

            // Wrap the array in an object to match expected structure on frontend
            var response = new JObject
            {
                ["reviews"] = reviewsArray
            };

            return Content(response.ToString(), "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error retrieving reviews: {ex.Message}");
        }
    }
}
