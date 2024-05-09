using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AbogaciaCore.Models;

namespace AbogaciaCore.Controllers
{

    [Route("Nosotros")]
    public class AboutUsController : Controller
    {

        public ActionResult Index()
        {
            return View("AboutUs");
        }
    }
}
