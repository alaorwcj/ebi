import requests
import time
from datetime import datetime

# URL of the backend API
API_URL = "http://localhost:8000/api/v1"

# The login credentials to obtain an admin token
LOGIN_DATA = {
    "username": "admin@ebi.com.br",
    "password": "adminpassword"
}

def get_token():
    print("Logging in to get admin token...")
    response = requests.post(f"{API_URL}/auth/login", data=LOGIN_DATA)
    if response.status_code == 200:
        print("Token acquired.")
        return response.json()["access_token"]
    else:
        print(f"Failed to log in: {response.text}")
        raise Exception("Login failed")

# We use the list parsed from the OCR
CHILDREN_DATA = [
     {"name": "Abel Batista Oliveira", "guardian": "Joyce Natinele Batista Oliveira", "dob": "2017-07-29"},
     {"name": "Abner Miguel de Almeida Rodrigues", "guardian": "Caroline Fernanda Santos Almeida Ribeir", "dob": "2016-03-09"},
     {"name": "Alice Nunes dos Santos Rodrigues", "guardian": "Jacqueline Nunes dos Santos Rodrigues", "dob": "2014-06-04"},
     {"name": "Arthur Vinícius Moreira", "guardian": "Bianca Moreira dos Santos", "dob": "2014-08-07"},
     {"name": "Bruna Ayla Camargo de Souza", "guardian": "Barbara Rúbia Camargo de Souza", "dob": "2016-02-29"},
     {"name": "Calebe Batista Oliveira", "guardian": "Joyce Natinele Batista Oliveira", "dob": "2016-05-19"},
     {"name": "Clarice Pérola Pereira Ventura", "guardian": "Cintia Pereira dos Santos Ventura", "dob": "2016-10-18"},
     {"name": "Davi Ferreira Barbosa", "guardian": "Ieda Santos Ferreira Barbosa", "dob": "2020-10-28"},
     {"name": "Gabriel Ferreira dos Santos", "guardian": "Lezenita Santana Souto dos Santos", "dob": "2014-04-09"},
     {"name": "Gabrielly Rodrigues Gherardi", "guardian": "Tamires Rodrigues Gherardi", "dob": "2016-05-05"},
     {"name": "Gustavo Henrique de Almeida Ribeiro", "guardian": "Caroline Fernanda Santos Almeida Ribeir", "dob": "2021-09-16"},
     {"name": "Heitor Pinheiro Machado Kubo", "guardian": "Ana Beatriz de Souza Lopes", "dob": "2019-10-19"},
     {"name": "Helena da Silva Belfort", "guardian": "Walewska Belfort Bezerra", "dob": "2020-03-04"},
     {"name": "João Ângelo Camargo Leite", "guardian": "Claudia Regina Camargo Pires", "dob": "2020-02-24"},
     {"name": "João Augusto dos Santos Pedroso", "guardian": "Vanessa da Silva Santos Pedroso", "dob": "2017-02-07"},
     {"name": "Juliana Rodrigues Morais", "guardian": "Tabata Rodrigues Morais", "dob": "2015-09-10"},
     {"name": "Kauã Vicente Bucke", "guardian": "Patricia Aparecida Vicente Bucke", "dob": "2017-05-14"},
     {"name": "Laura Pinheiro Kubo", "guardian": "Ana Beatriz de Souza Lopes", "dob": "2021-08-01"},
     {"name": "Laysa Sophie Camargo Leite", "guardian": "Claudia Regina Camargo Pires", "dob": "2019-02-25"},
     {"name": "Matteo Campos Garcia", "guardian": "Taís Campos de Oliveira Garcia", "dob": "2020-08-12"},
     {"name": "Paloma de Castro Rodrigues", "guardian": "Yasmin de Castro Gonçalves", "dob": "2015-09-01"},
     {"name": "Pedro Campos Garcia", "guardian": "Taís Campos de Oliveira Garcia", "dob": "2017-12-13"},
     {"name": "Pedro Silva Belfort", "guardian": "Walewska Belfort Bezerra", "dob": "2022-11-30"},
     {"name": "Rafaela dos Santos", "guardian": "Daniela Raimundo dos Santos", "dob": "2016-12-31"},
     {"name": "Samuel Simão Santos", "guardian": "Gisele Nunes dos Santos Simão", "dob": "2021-06-02"},
     {"name": "Sophia Pires Moreira", "guardian": "Tamires Rodrigues Gherardi", "dob": "2016-09-19"},
     {"name": "Vittorio Santos Peres de Carvalho", "guardian": "Daiane Santos Souza de Carvalho", "dob": "2021-01-25"},
     {"name": "Yasmin Vitória Pereira Pinheiro", "guardian": "Regiane Pereira Pinheiro", "dob": "2014-06-18"}
]

def format_child_payload(child):
    # Generating dummy phone numbers since they weren't in the list
    return {
        "name": child["name"],
        "birth_date": child["dob"],
        "guardians": [
            {
                "name": child["guardian"],
                "phone": "(11) 99999-9999" # Default format to pass validation
            }
        ]
    }

def main():
    token = get_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    success_count = 0
    fail_count = 0

    print(f"Starting registration for {len(CHILDREN_DATA)} children...")
    
    for i, child in enumerate(CHILDREN_DATA):
        payload = format_child_payload(child)
        print(f"Registering [{i+1}/{len(CHILDREN_DATA)}]: {child['name']}...")
        
        response = requests.post(f"{API_URL}/children", json=payload, headers=headers)
        
        if response.status_code == 200:
            success_count += 1
            print("  --> Success")
        else:
            fail_count += 1
            print(f"  --> Failed: {response.status_code} - {response.text}")
        
        # Give a small pause to avoid throttling
        time.sleep(0.1)

    print(f"\nRegistration complete. Success: {success_count}, Failed: {fail_count}")

if __name__ == "__main__":
    main()
