using System;
using System.Net;
using System.Net.Mail;
using AbogaciaCore.Models;
using Microsoft.AspNetCore.Mvc;

namespace AbogaciaCore.Controllers
{

    [Route("/Contacto")]
    public class ContactUsController : Controller
    {

        public ActionResult Index()
        {
            var model = new ContactModel();

            // Metadata para SEO
            ViewData["Title"] = "Contacto - Estudio Jurídico López Giacomelli";
            ViewData["Description"] = "Póngase en contacto con el Estudio Jurídico López Giacomelli para recibir asesoramiento legal en Argentina. Abogados especializados en derecho laboral y accidentes.";
            ViewData["Keywords"] = "contacto, abogados Buenos Aires, asesoramiento legal, estudio jurídico, derecho laboral, accidentes, despidos, consultas legales";

            return View("ContactUs", model);
        }

        // POST: home/Create
        [HttpPost]
        public ActionResult SendEmail(ContactModel model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    const string body = "<p><b>Email de:</b> {0} ({1})<p><b>Teléfono:</b> {4}</p><p><b>Asunto:</b> {2}</p></p><p><b>Mensaje:</b></p><p>{3}</p>";
                    var message = new MailMessage();
                    message.To.Add(new MailAddress("daniel.lipchak7603@gmail.com"));
                    //message.To.Add(new MailAddress("estudiolopezgiacomelli@gmail.com"));
                    message.From = new MailAddress(model.Email); // replace with valid value
                    message.Subject = model.Subject;
                    message.Body = string.Format(body, model.Name, model.Email, model.Subject, model.Message, model.Phone);
                    message.IsBodyHtml = true;
                    using var smtp = new SmtpClient();
                    // Configuración de las credenciales del SMTP
                    var credential = new NetworkCredential
                    {
                        UserName = "daniel.lipchak7603@gmail.com",
                        Password = "GFIpass123"
                    };
                    smtp.Credentials = credential;
                    smtp.Host = "smtp.gmail.com";
                    smtp.Port = 587;
                    smtp.EnableSsl = true;
                    smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                    smtp.Send(message);
                    return Json(new { success = true });
                }
                catch (Exception ex)
                {
                    return Json(new { success = false, error = ex.Message });
                }

            }
            else
            {
                return Json(new { success = false });
            }

        }
    }
}
