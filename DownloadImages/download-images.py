import json
import os
import requests

# Load the JSON data
json_data = [
    {
      "reviewerName": "Eduardo Ceballos",
      "profileUrl": "https://www.google.com/maps/contrib/112156166534888165250?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjX9XXz_f63DcpoB2zOvHYaGsEEnNeUURzzP3UrvZ-WddXHW-LuU=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Muy buena atención y rapidez, te sacan cualquier duda que tengas, me llevo el caso sebastian y un lujo pensé que iba a tardar más pero en menos del tiempo que se acordó se pudo solucionar recomendado",
      "reviewTime": "2 semanas atrás",
      "likeCount": "0"
    },
    {
      "reviewerName": "karina garro",
      "profileUrl": "https://www.google.com/maps/contrib/108221379871947266006?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjU0JuBhsKWq9DjUMyGUMDYzPKCqk748uV7PK4uYst7OOi2jKlHVMw=s40-c-rp-mo-ba4-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Un excelente estudio. Me quisieron estafar con el seguro y Sebastian lo resolvió. Muchas gracias",
      "reviewTime": "Hace un mes",
      "likeCount": "0"
    },
    {
      "reviewerName": "Marcelo Castillo",
      "profileUrl": "https://www.google.com/maps/contrib/114892572772366566142?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjXIqV1glTA-39O6T0YI6wQtxzrA_Ove5AMKWTHL4SWLx9UY3_s=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente atención del estudio en poco tiempo me resolvieron todo .Recomiendo absolutamente",
      "reviewTime": "Hace un mes",
      "likeCount": "0"
    },
    {
      "reviewerName": "Jose Oscar Torres",
      "profileUrl": "https://www.google.com/maps/contrib/106653743087921057883?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocLr85slCLipKVELYa4WcIIH0V8xX1Gwe11cxO0VsO_oa74EVQ=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Quiero dejar mi comentario, sinceramente es muy bueno y rápido las gestiones que realizó la Dra Silvana para darme una solución al problema del siniestro (choque automovilístico) estoy muy agradecido, ya que pensé que sería más tiempo.",
      "reviewTime": "Hace 2 meses",
      "likeCount": "1"
    },
    {
      "reviewerName": "Yesica Salto",
      "profileUrl": "https://www.google.com/maps/contrib/103627599772922160760?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocLxLk6dTSPllVCVHlo7NQ-MryxiDES-5JTBSmOOSVdetjGbMA=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Exelente trato y manejo profesional!Muy recomendable, atención en todo momento.  Y sobre todo sincero a la hora de trabajar!!",
      "reviewTime": "Hace 5 meses",
      "likeCount": "1"
    },
    {
      "reviewerName": "Oscar Gomez Gomez",
      "profileUrl": "https://www.google.com/maps/contrib/102989295184891425852?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocK6XgOiiKYFBKrUu9r6LFDUV6KcDR6qe6Gibi_NuYWu6NtW=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente atención y profesionalismo.Realizaron una gestión encomendada de forma rápida y exitosa.",
      "reviewTime": "Hace 3 meses",
      "likeCount": "1"
    },
    {
      "reviewerName": "Juan Carlos Martinez",
      "profileUrl": "https://www.google.com/maps/contrib/105595186290806459709?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocJC_aEtbix_H87N7vTrdW8v346budcB_at3OtVwHT5_JbxgNw=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "La verdad un re abogado, me resolvio todo super rapido, un genio Sebastian😊",
      "reviewTime": "Hace 5 meses",
      "likeCount": "1"
    },
    {
      "reviewerName": "Juan ramon Armoa gimenez",
      "profileUrl": "https://www.google.com/maps/contrib/105772313656758042171?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocLYVXjhKtFrAZumcidZHn1_92w9xSQeMDE099kxvccZAQtwHA=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente reclamo y orientacion cualquier dudas y reclamos fue rapidez recomiendo 100% son los mejores te dan solución en el momento gracias",
      "reviewTime": "Hace 7 meses",
      "likeCount": "3"
    },
    {
      "reviewerName": "Daniel Aguirre",
      "profileUrl": "https://www.google.com/maps/contrib/100227192189756057087?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocILw6pmY3UatMbyCV3mRgDpJNokYa3vOK4rQiS_SIV5OVy0hg=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Sebastián un súper profesional.  Se los recomiendo. Te resuelve y hace su funcion en tiempo y forma.",
      "reviewTime": "Hace 6 meses",
      "likeCount": "2"
    },
    {
      "reviewerName": "Romi.fernandez.91",
      "profileUrl": "https://www.google.com/maps/contrib/107654643576511216733?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocKwLD7eCBAh_lj--o9GaKGZd-T0gOePrOcl212j3kYrBpqIcg=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Todo en tiempo y forma! Excelente servicio! Muchas gracias !",
      "reviewTime": "Hace 6 meses",
      "likeCount": "1"
    },
    {
      "reviewerName": "Axel Alvarez",
      "profileUrl": "https://www.google.com/maps/contrib/118428428206149574699?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjXgN_F4VDqtGbKi5lR8ZHS6HBrfz71OiaZyshJeaw3cR-m3p1ek=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Trabajan muy bien y rapido.EXCELENTE 👌",
      "reviewTime": "Hace 6 meses",
      "likeCount": "2"
    },
    {
      "reviewerName": "Eduardo Batista",
      "profileUrl": "https://www.google.com/maps/contrib/112034593094494033920?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjXX6zqcGUCaXfZ9jgONSa1yL_2_YqOryivI9X-9eo-sgjPMo38D=s40-c-rp-mo-ba2-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente atención les lleve un reclamo me orientaron y agilizaron los trámites en menos de dos meses mí caso estaba resuelto, los recomiendo completamente.",
      "reviewTime": "Hace 10 meses",
      "likeCount": "3"
    },
    {
      "reviewerName": "patricia chingolani",
      "profileUrl": "https://www.google.com/maps/contrib/105005562745092596100?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocI7ZV4ROYoepKuFmmq_HJyD1SfaWDYmhrpR7BEnAIEuWy8QYg=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelentes profesionales!!!!!Hace años llevan todos nuestros casos.Son muy eficientes y sobre todo resuelven los problemas con suma rapidez.Siempre dispuestos a atender cualquiera de nuestras consultas, con un agradable trato y calidez.",
      "reviewTime": "Hace 2 años",
      "likeCount": "3"
    },
    {
      "reviewerName": "Gabx Llanos",
      "profileUrl": "https://www.google.com/maps/contrib/111682590551974605034?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjWqofg562xRP3a-8j-xIpKLn5sWs3AURr_4dAQS-pIKe6ZxwsOMXw=s40-c-rp-mo-ba4-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Trabajaron muy bien, siempre muy atentos siguiendo el caso; teniendo en cuenta todas las trabas de la burocracia argentina.100%recomendables la luchan hasta el final 💪💪💪",
      "reviewTime": "Hace 9 meses",
      "likeCount": "2"
    },
    {
      "reviewerName": "Dario Lopez",
      "profileUrl": "https://www.google.com/maps/contrib/116434700498634492122?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocLL_gQ7gBPLW3h4AlLW5fCtXZIL1p0D8mDaR-4eaY_6CSzBmg=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelentes profesionales y rapidez para solucionar los siniestros. Los recomiendo",
      "reviewTime": "Hace 7 meses",
      "likeCount": "3"
    },
    {
      "reviewerName": "miguel hugo placanica",
      "profileUrl": "https://www.google.com/maps/contrib/115173067501245065357?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocL0uzMV8lyATYIOtDqhgUoAlmT0NWqiE_UT93Dm9y9R-qD2Yw=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Muy buena atención,me solucionaron mi problema con mi seguro,hicieron un trabajo de hormiga y poco a poco lo consiguieronMuchas gracias y sigan asíSon para recomendarUn saludo",
      "reviewTime": "Hace un año",
      "likeCount": "3"
    },
    {
      "reviewerName": "Karina Marconi",
      "profileUrl": "https://www.google.com/maps/contrib/106070790152645667757?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocI7J_yLDQKpGHZSsK_pv5i8YcshsN7FJEv_-M56KM0if9NBKQ=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "\"Excelente atención\". Tanto Sebastián como Silvana fueron muy amables con el asesoramiento y súper eficientes. Me solucionaron mi problema con el seguro de forma muy expeditiva y lograron la mejor negociación a mi favor.",
      "reviewTime": "Hace un año",
      "likeCount": "2"
    },
    {
      "reviewerName": "Rolo Grisostolo",
      "profileUrl": "https://www.google.com/maps/contrib/115047486652635763247?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocJPyxJg1j4Bjms1EXHYRjdaZo2ZpdzbAfjgLjmugEbYamJ2og=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente atención  de silvana  , no es la primera vez que me soluciona un problema , el estudio es muy recomendable!",
      "reviewTime": "Hace 10 meses",
      "likeCount": "3"
    },
    {
      "reviewerName": "Jose Mereles",
      "profileUrl": "https://www.google.com/maps/contrib/117625844810127141678?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocJrPBFnWLJAeD0JzgBPfav8xcFOFjN-nYNw07roAulij1Aj-w=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente atención del Dr. López, muy conforme y agradecido por le trabajo realizado. Todo en tiempo y forma. Recomendable",
      "reviewTime": "Hace un año",
      "likeCount": "2"
    },
    {
      "reviewerName": "Maricel Algañaraz",
      "profileUrl": "https://www.google.com/maps/contrib/104691169803954662605?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocIYX-NhhPERPKPWy9tB7f92ine566ff7fDJeaF0ApeN0tNOEA=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelentes profesionales, resolvieron mí caso con rapidez, empatía y profesionalismo y quedé muy conforme con los resultados siempre q pueda los recomendaré. Muchas gracias nuevamente!!",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Juana Lemus",
      "profileUrl": "https://www.google.com/maps/contrib/115771639353508471847?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocIoN4H0FmtHxIe07FLYnIHuTGwOMSEMF5xPxaPpSn0CmffW7Q=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "La verdad que los chicos se pasaron me ayudaron en cada inconveniente que tuve y pudieron solucionarlo, la paciencia y un muy execelente trabajo, muy agradecida!!!!",
      "reviewTime": "Hace un año",
      "likeCount": "3"
    },
    {
      "reviewerName": "Gabriel Cidade",
      "profileUrl": "https://www.google.com/maps/contrib/112820249015489471393?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocKyn6rKoKy7118SSIFLmemle8L0qQ3_Jb48TBEXkRjup1Dgmg=s40-c-rp-mo-ba2-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Impecable!! Muy profecional y la atencion de Sebastian inmejorable, me soluciono un gran problema y en un tiempo record!! 100% recomendable. Muchas gracias por todo.",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Cristian Merched",
      "profileUrl": "https://www.google.com/maps/contrib/110141509439089659464?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocJPri9W0BQLSjg3pLYCARTcUJwvg76SEV1UONO5zYRXMUkT5Q=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Buen trabajo buena atención y rápida los recomiendo",
      "reviewTime": "Hace 9 meses",
      "likeCount": "2"
    },
    {
      "reviewerName": "Susana Saucedo",
      "profileUrl": "https://www.google.com/maps/contrib/107921730223205617757?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjXDsFWqNiVcrhL9SEhtupJuzNnCgDSrDYf9TbmHRmcIFvmkNDX_VQ=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente atención y rapidez en la resolución. Muy buen trabajo. Se los recomiendo.",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Francisca Letelier",
      "profileUrl": "https://www.google.com/maps/contrib/114968433237775524985?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjXwUd2nfnrTmU1u35oADZumSQ7VsSKuqdloQSYxuF6p-47O4rs=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente servicio!! Su trabajo es prolijo y muy bueno, full recomendado.Muchas gracias por todo",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Pablo Gabriel Armoa",
      "profileUrl": "https://www.google.com/maps/contrib/105580448832883997432?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjU1fzIglTIJ7HDXOMmLIaiA1-0bfVBSn7JIsl8PhJWb21Qx6Kk=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Exelente staff 100% recomendables buenos a atentos a tu demanda",
      "reviewTime": "Hace 10 meses",
      "likeCount": "3"
    },
    {
      "reviewerName": "Sergioacri Macri",
      "profileUrl": "https://www.google.com/maps/contrib/111789195048635684229?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocJ0Zcxjcuzvr-9js00veEojGXXkiaA3C_qvdZQmEdEV6zv3pw=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelentes profesionales y muy amables tanto Sebastián cómo Silvana.Recomendables 100x100",
      "reviewTime": "Hace un año",
      "likeCount": "3"
    },
    {
      "reviewerName": "oscar leonel Brizzi",
      "profileUrl": "https://www.google.com/maps/contrib/114752783625165534068?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocKZ2HOgwynSzG0WuiWLu1koYO-S7no6eAdDLTLMa5p3zQp3sA=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Profesionales excelentes.Eficientes en todo sentido.En mi experiencia, no solo solucionaron mi problema con rapidez, sino q obtuve mas de lo q esperaba.",
      "reviewTime": "Hace 2 años",
      "likeCount": "3"
    },
    {
      "reviewerName": "Fran Estrabón",
      "profileUrl": "https://www.google.com/maps/contrib/102014551504726723859?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjUtS5zLQnnYMJPMIXMd4l2Ez0Y7dERhqIfxRatQw_SoAGPqx-GRPA=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "excelentes profesionales! Buen asesoramiento, predisposición y servicio. Muy eficaces.",
      "reviewTime": "Hace un año",
      "likeCount": "2"
    },
    {
      "reviewerName": "Carmen Paolucci",
      "profileUrl": "https://www.google.com/maps/contrib/112980998674211594420?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjXJ31aVIdzo2IGcr0445khRUoDM2bw7UrseyNru7uDTZ0ASDnh0LQ=s40-c-rp-mo-ba4-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Este Estudio tiene un profesionalismo  increíble, Sebastián es un genio, quedé muy contenta con su trabajo que fue impecable. se los recomiendo.",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Norita Dieguez",
      "profileUrl": "https://www.google.com/maps/contrib/110347750167070323944?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjWM8JNMclHG_s7hmR1lNxYI1fszl1FR7T0m1Ls2G6V2cqE5RSyU=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Tuve el gusto de conocerlos a Silvana y Sebastián en mi peor momento laboral,En el cual su accionar fue muy eficaz y tuveMucha contención humana durante todo elProceso , excelentes personas muchas gracias.",
      "reviewTime": "Hace 2 años",
      "likeCount": "3"
    },
    {
      "reviewerName": "Matias Godoy",
      "profileUrl": "https://www.google.com/maps/contrib/108357250859464876594?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjWyTuLGNv57E-6h9P-6F4DZT0405Nzx7AbGnLOiGgcLxL5Z6rdymg=s40-c-rp-mo-ba3-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Super recomendables. Gestionaron todo en tiempo y forma. Sobrepasaron mis expectativas.",
      "reviewTime": "Hace un año",
      "likeCount": "2"
    },
    {
      "reviewerName": "Aldana Herlein",
      "profileUrl": "https://www.google.com/maps/contrib/114474828553755565615?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjXquJT8GJjZ6iAydmGMt0C9rjOTu4VEohdBm_GalF7RuMfz8asr=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Super recomendables! Excelente atención, asesoramiento rapido y super claros en todo.",
      "reviewTime": "Hace un año",
      "likeCount": "3"
    },
    {
      "reviewerName": "Viky Lordi",
      "profileUrl": "https://www.google.com/maps/contrib/114972156883159638971?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocKxbbaaaET7Kx6gurpitua94hsWsyVlc3INzUqIFtEwg7AXcQ=s40-c-rp-mo-ba3-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente trato y responsabilidad...muy comprometidos ... rapida gestión...muy conforme... gracias",
      "reviewTime": "Hace un año",
      "likeCount": "2"
    },
    {
      "reviewerName": "Jorge luis MArrazzi",
      "profileUrl": "https://www.google.com/maps/contrib/106438575132403156619?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocKUoWOtuvfNdPpAB6QPPpjqJ3X7DCP-OfedOSuoH9cMWrlwiA=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "La verdad muy buena atención  muy rápido y por sobre todo muy sincero es para recomendar",
      "reviewTime": "Hace un año",
      "likeCount": "2"
    },
    {
      "reviewerName": "cristian flores",
      "profileUrl": "https://www.google.com/maps/contrib/116049002959933618272?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjW32yQqlXYMJnOe2CYaU-bHwFoRmNXXtepR4VdRYtFvOPdTGqI=s40-c-rp-mo-ba2-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente atencion me asesoraron en tiempo y forma, mas que recomendable 👌",
      "reviewTime": "Hace un año",
      "likeCount": "3"
    },
    {
      "reviewerName": "cintia muñoz",
      "profileUrl": "https://www.google.com/maps/contrib/114962944738119687407?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocJc3aXj5Jh_D1Fes31vNBv9N-2u1w7G7W2SSzfQ6rxf2ab1sw=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Contención, asesoramiento y resolución. Sebastián nos atendió con empatía, transparencia y profesionalismo. Sin dudas los  recomendamos.",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Sergio Lipchak",
      "profileUrl": "https://www.google.com/maps/contrib/100829908243885968407?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocLyx_jKkSitXGQYt1VlJnmgCmYR_6mNYbndcSu3i88klozNLw=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "super profesionales. no esperaba que me dieran una solucion tan completa y rapida. muy agradecido con su trabajo!",
      "reviewTime": "Hace 2 años",
      "likeCount": "3"
    },
    {
      "reviewerName": "Martin Company",
      "profileUrl": "https://www.google.com/maps/contrib/113217698417363944710?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjUXsoWAQPnUyDMwEhjNfHOCZ-9BBX9RoMNnh59vGg0hOJvdUsrF=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Me solucionaron el problema rápido y con excelentes resultados en el acuerdo, super recomendables!!",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "lucas nicolas avendaño",
      "profileUrl": "https://www.google.com/maps/contrib/100426647338199479793?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjVL6lZtblaqJiXl8d2c7X-vypzqQSqAcoG4cexowBAemRvWzXwO=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Sebastian siempre fue muy atento y se manejo perfectamente antes las consultas y los problemas que e tenido.",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Ruben Carrera",
      "profileUrl": "https://www.google.com/maps/contrib/106150339081077074709?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocL2birWRg-5oGre3DTM3Z1r0y7eFonwQ4ap1PmAoCIghO6OuQ=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Muy conforme por el trato personal y profesional y contento con el resultado de la demanda !",
      "reviewTime": "Hace un año",
      "likeCount": "3"
    },
    {
      "reviewerName": "Matías RD",
      "profileUrl": "https://www.google.com/maps/contrib/109889066643572604730?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjW6w8KVjeq86jZFEqUU3-rD3K6VnRd0Jc-iQhT4NGZ2i1fUfrHo=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente y eficiente gestión de Sebastian para conseguir mi seguro.",
      "reviewTime": "Hace un año",
      "likeCount": "2"
    },
    {
      "reviewerName": "Lujan Guemes",
      "profileUrl": "https://www.google.com/maps/contrib/110139151749405302683?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocJW14J5bEkYqHCngRe2BdoeCWJSVokpyirXkcKQYEsEOUrQMg=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente profesionales ,  atención   resolución rápida  , recomendable .!!!",
      "reviewTime": "Hace un año",
      "likeCount": "2"
    },
    {
      "reviewerName": "Hugo B",
      "profileUrl": "https://www.google.com/maps/contrib/105346517786141648839?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocL4BnLRmypTUH2SKNhSREryrcK-AwZTvnnfa2Js8isd8z5g8A=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "100x100 RECOMENDABLE! Sebastián me asesoró desde el primer momento. MUY PROFESIONAL Y RESOLVIO MI CASO .MUY ATENTO!",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "zaa uma",
      "profileUrl": "https://www.google.com/maps/contrib/114123867945643013466?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocJ4gDkxaeguRSEWjrZAm0bVg6g6sjZl6Omtri4xYcOuQirVSw=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Lo recomiendo ampliamente, logró resolver mi caso y a su vez obtuve mas de lo esperado.",
      "reviewTime": "Hace un año",
      "likeCount": "2"
    },
    {
      "reviewerName": "Andrea Lomba",
      "profileUrl": "https://www.google.com/maps/contrib/107257537339852448351?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjWigWsq34RN-Jzg6Mks226djHgPiOmOwQbU27Xdzrl51inWM8Yc=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Sebastián se ha manejado con mucho profesionalismo, empatía y buen trato. Los recomiendo.",
      "reviewTime": "Hace 2 años",
      "likeCount": "3"
    },
    {
      "reviewerName": "Ezequiel Urdinez",
      "profileUrl": "https://www.google.com/maps/contrib/107029139057089043842?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocJiQZbJ8Uzsl99PnbvAv-JPqGbkYFD1ZaGHOKYWVl6I1xaUIA=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Trabajamos varias oportunidades con ellos por siniestros viales siempre con buenos resultados. Lo recomiendo",
      "reviewTime": "Hace 2 años",
      "likeCount": "3"
    },
    {
      "reviewerName": "Marcelo Barbero",
      "profileUrl": "https://www.google.com/maps/contrib/112219536559478285220?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocLEIZBcwYMceBAIb4FI5LtPRhgDmhOj9jeSMe7EoDbZU1bHZA=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente trato y atención muy recomendable",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Mercedes Barraz",
      "profileUrl": "https://www.google.com/maps/contrib/118189886270265216298?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocKaTaVHXBT779m-VtsieIVXWFBA7aefbRqkuBP5h2uJkCpZfA=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Es muy buen abogado los trámites los saco súper rápido y es muy recomendable muy humilde y muy sabio agradecida por haberlo encontrado",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Gladis Veron",
      "profileUrl": "https://www.google.com/maps/contrib/110525747244042687389?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocLRpM-UZwvkKBLSk4SMjb94Q-mmyd9KoPrNxQLMcix43f1KOA=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Un trabajo excelente, respuestas claras y rápidas, soluciones a los problemas.",
      "reviewTime": "Hace un año",
      "likeCount": "2"
    },
    {
      "reviewerName": "mari plaju",
      "profileUrl": "https://www.google.com/maps/contrib/107550039354016884034?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjXVI6wjt8pkbI6Abl8ZNYlUeA1DHzxHnTYWKpnynludztjxF4Egsw=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Buena calidad de atención y resolución inmediata, excelente calidad humana .",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Miguel Randone",
      "profileUrl": "https://www.google.com/maps/contrib/111848170201825786850?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjWEtmayN-HotSsCpTNq_LW1E20lokXdiSY9pF6T68FcX9bwGvJi=s40-c-rp-mo-ba2-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente atención  y rapidez  en resolver la demanda  ,muy recomendable",
      "reviewTime": "Hace un año",
      "likeCount": "2"
    },
    {
      "reviewerName": "gustavo haylan",
      "profileUrl": "https://www.google.com/maps/contrib/114009631750217566124?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjXIly6QI00Ga4N5cpfw1EWbIcYOSiOGU1VF-Px2qno25W4wRs6C=s40-c-rp-mo-ba3-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Muy buena atención y una rápida resolución. Muy recomendable",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Alejandra Merched",
      "profileUrl": "https://www.google.com/maps/contrib/109571051905115979187?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocJfgWl4A4J1wdSGnqUJjBUNmx4mPGq5dhFpuTY6rW4Z2UHHcg=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente profesional,100%recomendable",
      "reviewTime": "Hace un año",
      "likeCount": "2"
    },
    {
      "reviewerName": "Daniel Canteros",
      "profileUrl": "https://www.google.com/maps/contrib/112878863805534065825?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjVverBEPi1f6CZbdfrYGCg4Ezu4jvadw-9Obz3n7lW83gIOZzLA=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente atencion!!! Muy recomendable!! Gracias Sebastian!!",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Federico Martinez",
      "profileUrl": "https://www.google.com/maps/contrib/108052166995218162465?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjUMR9kpYMVTNoOzEfRwoZbmvvvN3qAS6HNwLZljNN_Qc1sTGjDJ=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Unos genios resolvieron mi problema automovilistico en tiempo y forma",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Leo gamella",
      "profileUrl": "https://www.google.com/maps/contrib/106553138322114155497?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjVf0ky7a74Q2Q9ke0dAxabpjweTnhAxOFyF3nIVpkuLn9eBbXdy=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente estudio, super recomendable de confianza!",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "EMILIO Gould",
      "profileUrl": "https://www.google.com/maps/contrib/112989011813681669460?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocIzxoJ3HqnPTEGtwDd3Dogku3djkVNBsozkINkfbwcNBc-QQg=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Muy buena atención, lo recomiendo!!!",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Geraldine Saad Centurion",
      "profileUrl": "https://www.google.com/maps/contrib/113090762926480144403?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjVOt0pH8IYgg3zy0PhSMhdSo6R1h_UOik1kjBySfrcCKPutajyofQ=s40-c-rp-mo-ba3-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelentes profesionales y maravillosas personas.",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Pablo Forgia",
      "profileUrl": "https://www.google.com/maps/contrib/109620471669779112728?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocLyjeJAECTgGr2kBnj_riUuCt0Z14hcmRKi_Si6PIYgTCbUcw=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente atención y predisposición.  De diez!! 👌🏼",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Juan Carlos Mansilla",
      "profileUrl": "https://www.google.com/maps/contrib/110386866174822414700?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocKUmU-TJVbWEo8-mgmvoERVLULj2DkKq-tNM-4xTetsAAOxGw=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Muy sincero,muy profecional y honesto",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Walter Razzetto",
      "profileUrl": "https://www.google.com/maps/contrib/108348986748306150262?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocK9a12eyJ2yl0s5uBw3RRIxInyN-koLSQJnfje7ZQgVK98MWg=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente atención!!!",
      "reviewTime": "Hace 7 meses",
      "likeCount": "2"
    },
    {
      "reviewerName": "Gaston Bongiovanni",
      "profileUrl": "https://www.google.com/maps/contrib/102903531194524478849?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocJhLwPROEJw8lI9-diYCs4-bXHTBxxwKX90WdYDQSLViaqG0w=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelente atencion 👍muy recomendable",
      "reviewTime": "Hace 2 años",
      "likeCount": "2"
    },
    {
      "reviewerName": "Diego Jara",
      "profileUrl": "https://www.google.com/maps/contrib/112473137544972871760?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocIo-qlTgzNAFNaq1iCrjsI8WmiEiaTso1W2mWwIXUQTCmREYw=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": "Excelentes profesionales.recomendables!!!",
      "reviewTime": "Hace 2 años",
      "likeCount": "3"
    },
    {
      "reviewerName": "Francesco Serpagli",
      "profileUrl": "https://www.google.com/maps/contrib/113902308402647173496?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjVFWmZdh3Tk7pUdfwpmu1QnG_Ygh9gJaMDsdPKq1-GOifycJfQx=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": None,
      "reviewTime": "Hace 9 meses",
      "likeCount": "0"
    },
    {
      "reviewerName": "Matias Marchetti",
      "profileUrl": "https://www.google.com/maps/contrib/108769300998006439173?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocKqIHK_tdHQwpT3gzFRGr0WY1_caWBCS1_7-39bTP_Dw34qYQ=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": None,
      "reviewTime": "Hace 2 años",
      "likeCount": "0"
    },
    {
      "reviewerName": "Martin Correa",
      "profileUrl": "https://www.google.com/maps/contrib/101140027891344169681?hl=es-419&ved=1t:31294&ictx=111",
      "imageUrl": "https://lh3.googleusercontent.com/a-/ALV-UjVtGorrFbyCmZy0JOYsFko6UuC1ZVOIAkn47GMpE9FffJiD1QYV=s40-c-rp-mo-br100",
      "rating": "Calificación: 5.0 de 5,",
      "reviewText": None,
      "reviewTime": "Hace 2 años",
      "likeCount": "0"
    }
  ]

# Specify the folder to save images
output_folder = "review_images"
os.makedirs(output_folder, exist_ok=True)  # Create the folder if it doesn't exist

# Loop through each entry in the JSON data
for index, entry in enumerate(json_data):
    image_url = entry["imageUrl"]
    reviewer_name = entry["reviewerName"].replace(" ", "_")  # Use reviewer's name in filename
    
    # Construct the image filename and path
    image_filename = f"{reviewer_name}_{index}.jpg"
    image_path = os.path.join(output_folder, image_filename)
    
    # Download the image
    try:
        response = requests.get(image_url, stream=True)
        if response.status_code == 200:
            with open(image_path, "wb") as image_file:
                for chunk in response.iter_content(1024):
                    image_file.write(chunk)
            print(f"Downloaded {image_filename}")
        else:
            print(f"Failed to download {image_url}")
    except Exception as e:
        print(f"Error downloading {image_url}: {e}")
