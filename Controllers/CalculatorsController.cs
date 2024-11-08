using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AbogaciaCore.Models;

namespace AbogaciaCore.Controllers
{
    [Route("/calculadoras/[action]")]
    public class CalculatorsController : Controller
    {
        [ActionName("accidentes-laborales")]
        public ActionResult CalculatorWorkAccident()
        {
            ViewData["Title"] = "Calculadora de Indemnización por Accidentes Laborales";
            ViewData["Description"] = "Calcule su indemnización por accidentes laborales con nuestra herramienta práctica y precisa.";
            ViewData["Keywords"] = "calculadora accidentes laborales, indemnización laboral, ART Buenos Aires, derechos laborales, abogado laboralista";
            return View("CalculatorWorkAccident");
        }

        [ActionName("accidentes-de-transito")]
        public ActionResult CalculatorTrafficAccident()
        {
            ViewData["Title"] = "Calculadora de Indemnización por Accidentes de Tránsito";
            ViewData["Description"] = "Use nuestra calculadora para estimar la indemnización en caso de accidente de tránsito. Herramienta útil para conocer sus derechos legales.";
            ViewData["Keywords"] = "calculadora accidentes de tránsito, indemnización accidentes, abogado accidentes, ART Buenos Aires, reclamo de daños";
            return View("CalculatorTrafficAccident");
        }

        [ActionName("despidos")]
        public ActionResult CalculatorWorkDismissal()
        {
            ViewData["Title"] = "Calculadora de Indemnización por Despido";
            ViewData["Description"] = "Calcule su indemnización en caso de despido. Herramienta práctica para conocer sus derechos laborales y obtener una estimación precisa.";
            ViewData["Keywords"] = "calculadora despidos, indemnización despido, derechos laborales, abogado laboralista Buenos Aires, indemnización laboral";
            return View("CalculatorWorkDismissal");
        }
    }
}
