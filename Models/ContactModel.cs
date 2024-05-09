using System;
using System.ComponentModel.DataAnnotations;

namespace AbogaciaCore.Models
{
    public class ContactModel
    {
        [Required, Display(Name = "Nombre")]
        public string Name { get; set; }
        [Required, Display(Name = "Email"), EmailAddress]
        public string Email { get; set; }

        [Required, Display(Name = "Asunto")]
        public string Subject { get; set; }

        [Required, Display(Name = "Mensaje")]
        public string Message { get; set; }

        [Required, Display(Name = "Teléfono")]
        public string Phone { get; set; }
    }
}