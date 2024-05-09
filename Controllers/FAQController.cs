using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using AbogaciaCore.Models;
using Microsoft.AspNetCore.Mvc;

namespace AbogaciaCore.Controllers {

    [Route ("/preguntas-frecuentes/[action]")]
    public class FAQController : Controller {

        [ActionName ("accidentes-laborales")]
        public ActionResult WorkAccidentFaq () {
            return View ("WorkAccidentFaq");
        }

        [ActionName ("accidentes-de-tránsito")]
        public ActionResult TrafficAccidentFaq () {
            return View ("TrafficAccidentFaq");
        }

        [ActionName ("despidos")]
        public ActionResult DismissalsFaq () {
            return View ("DismissalsFaq");
        }

    }
}