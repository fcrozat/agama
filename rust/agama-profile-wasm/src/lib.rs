use wasm_bindgen::prelude::*;
use serde_json::Value;

#[wasm_bindgen]
pub struct ValidationResult {
    is_valid: bool,
    errors: Vec<String>,
}

#[wasm_bindgen]
impl ValidationResult {
    #[wasm_bindgen(getter)]
    pub fn is_valid(&self) -> bool {
        self.is_valid
    }

    #[wasm_bindgen(getter)]
    pub fn errors(&self) -> Vec<String> {
        self.errors.clone()
    }
}

#[wasm_bindgen]
pub fn validate_profile(profile_yaml: &str, schema_json: &str) -> Result<ValidationResult, JsValue> {
    console_error_panic_hook::set_once();

    let schema: Value = serde_json::from_str(schema_json)
        .map_err(|e| JsValue::from_str(&format!("Invalid schema JSON: {}", e)))?;

    let profile: Value = serde_yaml::from_str(profile_yaml)
        .map_err(|e| JsValue::from_str(&format!("Invalid profile YAML: {}", e)))?;

    let validator = jsonschema::validator_for(&schema)
        .map_err(|e| JsValue::from_str(&format!("Failed to create validator: {}", e)))?;

    let mut errors = Vec::new();
    for error in validator.iter_errors(&profile) {
        errors.push(format!("{}. Path: {}", error, error.instance_path));
    }

    Ok(ValidationResult {
        is_valid: errors.is_empty(),
        errors,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_profile_valid() {
        let schema = r#"{
            "type": "object",
            "properties": {
                "product": { "type": "string" }
            },
            "required": ["product"]
        }"#;
        let profile = "product: Tumbleweed";
        let result = validate_profile(profile, schema).unwrap();
        assert!(result.is_valid());
        assert!(result.errors().is_empty());
    }

    #[test]
    fn test_validate_profile_invalid() {
        let schema = r#"{
            "type": "object",
            "properties": {
                "product": { "type": "string" }
            },
            "required": ["product"]
        }"#;
        let profile = "wrong: field";
        let result = validate_profile(profile, schema).unwrap();
        assert!(!result.is_valid());
        assert!(!result.errors().is_empty());
        assert!(result.errors()[0].contains("product\" is a required property"));
    }
}
