using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AbogaciaCore.Models;

namespace AbogaciaCore.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            var model = new ContactModel();
            return View("Home", model);
        }


    }
}
