using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AbogaciaCore.Models;

namespace AbogaciaCore.Controllers
{
        [Route ("/calculadoras/[action]")]
    public class CalculatorsController : Controller
    {
     [ActionName ("accidentes-laborales")]
        public ActionResult CalculatorWorkAccident()
        {
            return View("CalculatorWorkAccident");
        }

        [ActionName ("accidentes-de-tránsito")]
        public ActionResult CalculatorTrafficAccident()
        {
            return View("CalculatorTrafficAccident");
        }

        [ActionName ("despidos")]
        public ActionResult CalculatorWorkDismissal()
        {
            return View("CalculatorWorkDismissal");
        }
    }
}
