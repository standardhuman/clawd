import Contacts
import Foundation

let store = CNContactStore()
let keys = [CNContactGivenNameKey, CNContactFamilyNameKey, CNContactPhoneNumbersKey] as [CNKeyDescriptor]
let request = CNContactFetchRequest(keysToFetch: keys)
var lookup: [String: String] = [:]

try! store.enumerateContacts(with: request) { contact, _ in
    let name = "\(contact.givenName) \(contact.familyName)".trimmingCharacters(in: .whitespaces)
    guard !name.isEmpty else { return }
    for phone in contact.phoneNumbers {
        let digits = phone.value.stringValue.filter { $0.isNumber }
        if digits.count >= 10 {
            lookup[String(digits.suffix(10))] = name
        }
    }
}

// Read phone numbers from stdin, output name mappings as JSON
var result: [String: String] = [:]
for number in CommandLine.arguments.dropFirst() {
    let digits = number.filter { $0.isNumber }
    let key = String(digits.suffix(10))
    if let name = lookup[key] {
        result[number] = name
    }
}

let data = try! JSONSerialization.data(withJSONObject: result)
print(String(data: data, encoding: .utf8)!)
