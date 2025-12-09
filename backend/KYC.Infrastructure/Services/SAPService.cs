using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace KYC.Infrastructure.Services;

public class SAPService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private string? _sessionId;

    public SAPService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<bool> LoginAsync()
    {
        var sapSettings = _configuration.GetSection("SAPSettings");
        var loginUrl = $"{sapSettings["ServiceLayerUrl"]}/Login";

        var loginData = new
        {
            CompanyDB = sapSettings["CompanyDB"],
            UserName = sapSettings["Username"],
            Password = sapSettings["Password"]
        };

        var content = new StringContent(
            JsonSerializer.Serialize(loginData),
            Encoding.UTF8,
            "application/json");

        var response = await _httpClient.PostAsync(loginUrl, content);

        if (response.IsSuccessStatusCode)
        {
            var result = await response.Content.ReadAsStringAsync();
            var jsonDoc = JsonDocument.Parse(result);
            _sessionId = jsonDoc.RootElement.GetProperty("SessionId").GetString();
            return true;
        }

        return false;
    }

    public async Task<string?> CreateBusinessPartnerAsync(object businessPartner)
    {
        if (string.IsNullOrEmpty(_sessionId))
        {
            await LoginAsync();
        }

        var sapSettings = _configuration.GetSection("SAPSettings");
        var url = $"{sapSettings["ServiceLayerUrl"]}/BusinessPartners";

        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("Cookie", $"B1SESSION={_sessionId}");
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var content = new StringContent(
            JsonSerializer.Serialize(businessPartner),
            Encoding.UTF8,
            "application/json");

        var response = await _httpClient.PostAsync(url, content);

        if (response.IsSuccessStatusCode)
        {
            var result = await response.Content.ReadAsStringAsync();
            var jsonDoc = JsonDocument.Parse(result);
            return jsonDoc.RootElement.GetProperty("CardCode").GetString();
        }

        return null;
    }
}
