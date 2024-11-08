using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using AbogaciaCore.Models;
using Microsoft.AspNetCore.Mvc;

namespace AbogaciaCore.Controllers
{
    [Route("/preguntas-frecuentes/[action]")]
    public class FAQController : Controller
    {
        [ActionName("accidentes-laborales")]
        public ActionResult WorkAccidentFaq()
        {
            ViewData["Title"] = "Preguntas Frecuentes sobre Accidentes Laborales";
            ViewData["Description"] = "Encuentre respuestas a las preguntas más comunes sobre accidentes laborales y derechos de los trabajadores en Argentina.";
            ViewData["Keywords"] = "accidentes laborales, derechos del trabajador, abogado laboralista, ART Buenos Aires, protección laboral";
            return View("WorkAccidentFaq");
        }

        [ActionName("accidentes-de-transito")]
        public ActionResult TrafficAccidentFaq()
        {
            ViewData["Title"] = "Preguntas Frecuentes sobre Accidentes de Tránsito";
            ViewData["Description"] = "Consulte nuestras respuestas a preguntas frecuentes sobre accidentes de tránsito y reclamación de indemnización.";
            ViewData["Keywords"] = "accidentes de tránsito, indemnización accidentes, abogado accidentes, ART Buenos Aires, reclamo de daños";
            return View("TrafficAccidentFaq");
        }

        [ActionName("despidos")]
        public ActionResult DismissalsFaq()
        {
            ViewData["Title"] = "Preguntas Frecuentes sobre Despidos";
            ViewData["Description"] = "Conozca sus derechos en caso de despido injustificado o conflictos laborales. Encuentre respuestas a las preguntas frecuentes sobre despidos.";
            ViewData["Keywords"] = "despidos, derechos laborales, indemnización despido, abogado laboralista Buenos Aires, asesoría laboral";
            return View("DismissalsFaq");
        }
    }
}
