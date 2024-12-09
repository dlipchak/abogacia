using System;
using System.Globalization;

namespace AbogaciaCore.Helpers
{
    public static class StringExtensions
    {
        public static string ToTitleCase(this string title)
        {
            return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(title.ToLower());
        }
        public static string Capitalize(this string title)
        {
            var lower = title.ToLower();
            var capitalized = char.ToUpper(lower[0]) + lower.Substring(1);
            return capitalized;
        }
        public static string ToCamelCase(this string str)
        {
            if (string.IsNullOrEmpty(str))
                return str;

            var words = str.Split(new[] { ' ', '-', '_' }, StringSplitOptions.RemoveEmptyEntries);
            var result = words[0].ToLower();

            for (int i = 1; i < words.Length; i++)
            {
                result += CultureInfo.CurrentCulture.TextInfo.ToTitleCase(words[i].ToLower());
            }

            return result;
        }
        public static string LowerFirstLetter(this string str)
        {
            if (string.IsNullOrEmpty(str))
                return str;
                
            return char.ToLower(str[0]) + str.Substring(1);
        }
    }
}