using System;

namespace KYC.Shared.DTOs
{
    public class VendorDto
    {
        public int Id { get; set; }
        public string VendorCode { get; set; } = null!;
        public string VendorName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string KYCStatus { get; set; } = "DRAFT";
        public int? DivisionId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public string? CreatedByName { get; set; }
    }
}
