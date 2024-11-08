using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace AbogaciaCore.Controllers
{
    [Route("/despidos/[action]")]
    public class DismissalsController : Controller
    {
        [ActionName("derechos-del-trabajador")]
        public ActionResult WorkerRights()
        {
            // Set SEO properties for Worker Rights page
            ViewData["Title"] = "Asesoría en Derechos del Trabajador - Estudio Jurídico López Giacomelli";
            ViewData["Description"] = "Descubra sus derechos laborales en Argentina. Asesoría legal especializada en protección de derechos del trabajador en Buenos Aires.";
            ViewData["Keywords"] = "derechos del trabajador, abogados laborales Buenos Aires, asesoría laboral, protección laboral Argentina";

            return View("WorkerRights");
        }
    }
}
