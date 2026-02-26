from datetime import date, datetime, timezone

from app.core.db import SessionLocal
from app.core.security import get_password_hash
from app.models.child import Child
from app.models.guardian import ChildGuardian
from app.models.ebi import Ebi, EbiStatus
from app.models.presence import EbiPresence
from app.models.user import User, UserRole
from app.repositories.user_repo import get_user_by_email


# ---------------------------------------------------------------------------
# Dados de seed – todos os perfis
# Senhas: admin001 / coord001 / colab001  (sufixo 3 dígitos)
# ---------------------------------------------------------------------------

ADMINISTRATORS = [
    {
        "full_name": "Carlos Alberto Mendes",
        "email": "admin@ebi.local",
        "phone": "(11) 99999-0000",
        "group_number": 1,
        "password": "admin001",
        "cpf": "111.111.111-11",
        "rg": "11.111.111-1",
        "birth_date": date(1980, 3, 15),
        "address": "Rua das Flores, 100",
        "city": "São Paulo",
        "state": "SP",
        "zip_code": "01310-100",
        "emergency_contact_name": "Maria Mendes",
        "emergency_contact_phone": "(11) 98888-1111",
    },
    {
        "full_name": "Fernanda Lima Costa",
        "email": "admin2@ebi.local",
        "phone": "(11) 99999-0010",
        "group_number": 2,
        "password": "admin002",
        "cpf": "222.222.222-22",
        "rg": "22.222.222-2",
        "birth_date": date(1985, 7, 22),
        "address": "Av. Paulista, 200",
        "city": "São Paulo",
        "state": "SP",
        "zip_code": "01310-200",
        "emergency_contact_name": "João Costa",
        "emergency_contact_phone": "(11) 97777-2222",
    },
    {
        "full_name": "Roberto Alves Souza",
        "email": "admin3@ebi.local",
        "phone": "(21) 99999-0020",
        "group_number": 3,
        "password": "admin003",
        "cpf": "333.333.333-33",
        "rg": "33.333.333-3",
        "birth_date": date(1978, 11, 5),
        "address": "Rua do Catete, 300",
        "city": "Rio de Janeiro",
        "state": "RJ",
        "zip_code": "22220-000",
        "emergency_contact_name": "Ana Souza",
        "emergency_contact_phone": "(21) 96666-3333",
    },
]

COORDINATORS = [
    {
        "full_name": "Coordenadora Seed",
        "email": "coord@ebi.local",
        "phone": "(11) 99999-0001",
        "group_number": 1,
        "password": "coord001",
        "cpf": "444.444.444-44",
        "rg": "44.444.444-4",
        "birth_date": date(1990, 1, 10),
        "address": "Rua das Palmeiras, 10",
        "city": "São Paulo",
        "state": "SP",
        "zip_code": "04001-001",
        "emergency_contact_name": "Pedro Silva",
        "emergency_contact_phone": "(11) 95555-4444",
    },
    {
        "full_name": "Juliana Pereira Ramos",
        "email": "coord2@ebi.local",
        "phone": "(11) 99999-0011",
        "group_number": 1,
        "password": "coord002",
        "cpf": "555.555.555-55",
        "rg": "55.555.555-5",
        "birth_date": date(1988, 4, 25),
        "address": "Rua das Acácias, 20",
        "city": "São Paulo",
        "state": "SP",
        "zip_code": "04001-002",
        "emergency_contact_name": "Lucas Ramos",
        "emergency_contact_phone": "(11) 94444-5555",
    },
    {
        "full_name": "Patrícia Gomes Ferreira",
        "email": "coord3@ebi.local",
        "phone": "(11) 99999-0021",
        "group_number": 2,
        "password": "coord003",
        "cpf": "666.666.666-66",
        "rg": "66.666.666-6",
        "birth_date": date(1992, 9, 8),
        "address": "Av. Brigadeiro Faria Lima, 500",
        "city": "São Paulo",
        "state": "SP",
        "zip_code": "01452-001",
        "emergency_contact_name": "Ricardo Ferreira",
        "emergency_contact_phone": "(11) 93333-6666",
    },
    {
        "full_name": "Aline Barbosa Martins",
        "email": "coord4@ebi.local",
        "phone": "(31) 99999-0031",
        "group_number": 2,
        "password": "coord004",
        "cpf": "777.777.777-77",
        "rg": "77.777.777-7",
        "birth_date": date(1986, 6, 30),
        "address": "Rua da Bahia, 700",
        "city": "Belo Horizonte",
        "state": "MG",
        "zip_code": "30160-010",
        "emergency_contact_name": "Marcos Martins",
        "emergency_contact_phone": "(31) 92222-7777",
    },
    {
        "full_name": "Simone Carvalho Nunes",
        "email": "coord5@ebi.local",
        "phone": "(51) 99999-0041",
        "group_number": 3,
        "password": "coord005",
        "cpf": "888.888.888-88",
        "rg": "88.888.888-8",
        "birth_date": date(1983, 12, 18),
        "address": "Av. Ipiranga, 1200",
        "city": "Porto Alegre",
        "state": "RS",
        "zip_code": "90420-001",
        "emergency_contact_name": "Daniel Nunes",
        "emergency_contact_phone": "(51) 91111-8888",
    },
]

COLLABORATORS = [
    {
        "full_name": "Colaboradora Seed",
        "email": "colab@ebi.local",
        "phone": "(11) 99999-0002",
        "group_number": 1,
        "password": "colab001",
        "cpf": "100.100.100-10",
        "rg": "10.100.100-1",
        "birth_date": date(1995, 2, 14),
        "address": "Rua Vergueiro, 50",
        "city": "São Paulo",
        "state": "SP",
        "zip_code": "01504-000",
        "emergency_contact_name": "Lúcia Santos",
        "emergency_contact_phone": "(11) 90000-1100",
    },
    {
        "full_name": "Bruna Oliveira Santos",
        "email": "colab2@ebi.local",
        "phone": "(11) 99999-0012",
        "group_number": 1,
        "password": "colab002",
        "cpf": "200.200.200-20",
        "rg": "20.200.200-2",
        "birth_date": date(1997, 5, 20),
        "address": "Rua Augusta, 80",
        "city": "São Paulo",
        "state": "SP",
        "zip_code": "01305-000",
        "emergency_contact_name": "Paulo Oliveira",
        "emergency_contact_phone": "(11) 89999-2200",
    },
    {
        "full_name": "Camila Rodrigues Lopes",
        "email": "colab3@ebi.local",
        "phone": "(11) 99999-0022",
        "group_number": 1,
        "password": "colab003",
        "cpf": "300.300.300-30",
        "rg": "30.300.300-3",
        "birth_date": date(1993, 8, 3),
        "address": "Rua Oscar Freire, 150",
        "city": "São Paulo",
        "state": "SP",
        "zip_code": "01426-001",
        "emergency_contact_name": "Clara Lopes",
        "emergency_contact_phone": "(11) 88888-3300",
    },
    {
        "full_name": "Débora Andrade Lima",
        "email": "colab4@ebi.local",
        "phone": "(11) 99999-0032",
        "group_number": 2,
        "password": "colab004",
        "cpf": "400.400.400-40",
        "rg": "40.400.400-4",
        "birth_date": date(1991, 10, 27),
        "address": "Rua Consolação, 200",
        "city": "São Paulo",
        "state": "SP",
        "zip_code": "01302-000",
        "emergency_contact_name": "Márcio Lima",
        "emergency_contact_phone": "(11) 87777-4400",
    },
    {
        "full_name": "Elaine Fonseca Azevedo",
        "email": "colab5@ebi.local",
        "phone": "(21) 99999-0042",
        "group_number": 2,
        "password": "colab005",
        "cpf": "500.500.500-50",
        "rg": "50.500.500-5",
        "birth_date": date(1996, 3, 12),
        "address": "Rua do Ouvidor, 300",
        "city": "Rio de Janeiro",
        "state": "RJ",
        "zip_code": "20040-030",
        "emergency_contact_name": "Tiago Azevedo",
        "emergency_contact_phone": "(21) 86666-5500",
    },
    {
        "full_name": "Fabiana Correia Vieira",
        "email": "colab6@ebi.local",
        "phone": "(21) 99999-0052",
        "group_number": 2,
        "password": "colab006",
        "cpf": "600.600.600-60",
        "rg": "60.600.600-6",
        "birth_date": date(1994, 7, 19),
        "address": "Av. Rio Branco, 400",
        "city": "Rio de Janeiro",
        "state": "RJ",
        "zip_code": "20040-008",
        "emergency_contact_name": "Henrique Vieira",
        "emergency_contact_phone": "(21) 85555-6600",
    },
    {
        "full_name": "Gabriela Moraes Castro",
        "email": "colab7@ebi.local",
        "phone": "(31) 99999-0062",
        "group_number": 3,
        "password": "colab007",
        "cpf": "700.700.700-70",
        "rg": "70.700.700-7",
        "birth_date": date(1998, 1, 6),
        "address": "Av. Afonso Pena, 500",
        "city": "Belo Horizonte",
        "state": "MG",
        "zip_code": "30130-003",
        "emergency_contact_name": "Felipe Castro",
        "emergency_contact_phone": "(31) 84444-7700",
    },
    {
        "full_name": "Helena Pinto Carvalho",
        "email": "colab8@ebi.local",
        "phone": "(51) 99999-0072",
        "group_number": 3,
        "password": "colab008",
        "cpf": "800.800.800-80",
        "rg": "80.800.800-8",
        "birth_date": date(1999, 11, 30),
        "address": "Rua dos Andradas, 600",
        "city": "Porto Alegre",
        "state": "RS",
        "zip_code": "90020-004",
        "emergency_contact_name": "Diego Carvalho",
        "emergency_contact_phone": "(51) 83333-8800",
    },
]


def _create_user_if_not_exists(db, data: dict, role: UserRole) -> User:
    user = get_user_by_email(db, data["email"])
    if not user:
        user = User(
            full_name=data["full_name"],
            email=data["email"],
            phone=data["phone"],
            role=role,
            group_number=data["group_number"],
            password_hash=get_password_hash(data["password"]),
            cpf=data.get("cpf"),
            rg=data.get("rg"),
            birth_date=data.get("birth_date"),
            address=data.get("address"),
            city=data.get("city"),
            state=data.get("state"),
            zip_code=data.get("zip_code"),
            emergency_contact_name=data.get("emergency_contact_name"),
            emergency_contact_phone=data.get("emergency_contact_phone"),
        )
        db.add(user)
        print(f"  [+] {role.value}: {data['email']}")
    return user


def run_seed() -> None:
    db = SessionLocal()
    try:
        print("==> Criando Administradores...")
        for data in ADMINISTRATORS:
            _create_user_if_not_exists(db, data, UserRole.ADMINISTRADOR)
        db.commit()

        print("==> Criando Coordenadoras...")
        for data in COORDINATORS:
            _create_user_if_not_exists(db, data, UserRole.COORDENADORA)
        db.commit()

        print("==> Criando Colaboradoras...")
        for data in COLLABORATORS:
            _create_user_if_not_exists(db, data, UserRole.COLABORADORA)
        db.commit()

        # Referências para EBI seed
        coordinator = get_user_by_email(db, "coord@ebi.local")
        collaborator = get_user_by_email(db, "colab@ebi.local")

        print("==> Criando Criança de exemplo...")
        child = db.query(Child).first()
        if not child:
            child = Child(
                name="Crianca Seed",
                guardian_name="Responsavel Seed",
                guardian_phone="(11) 98888-0000",
            )
            child.guardians = [
                ChildGuardian(name="Responsavel Seed", phone="(11) 98888-0000"),
                ChildGuardian(name="Responsavel 2", phone="(11) 97777-0000"),
            ]
            db.add(child)
            db.commit()
            print("  [+] Criança adicionada.")

        print("==> Criando EBI de exemplo...")
        ebi = db.query(Ebi).first()
        if not ebi:
            ebi = Ebi(
                ebi_date=datetime.now(timezone.utc).date(),
                group_number=1,
                coordinator_id=coordinator.id,
                status=EbiStatus.ABERTO,
            )
            ebi.collaborators = [collaborator]
            db.add(ebi)
            db.commit()
            print("  [+] EBI adicionado.")

        print("==> Criando Presença de exemplo...")
        presence = db.query(EbiPresence).filter(EbiPresence.ebi_id == ebi.id).first()
        if not presence:
            presence = EbiPresence(
                ebi_id=ebi.id,
                child_id=child.id,
                guardian_name_day=child.guardian_name,
                guardian_phone_day=child.guardian_phone,
                entry_at=datetime.now(timezone.utc),
                pin_code="1234",
            )
            db.add(presence)
            db.commit()
            print("  [+] Presença adicionada.")

        print("\nSeed concluido com sucesso!")
        print(f"  Administradores : {len(ADMINISTRATORS)}")
        print(f"  Coordenadoras   : {len(COORDINATORS)}")
        print(f"  Colaboradoras   : {len(COLLABORATORS)}")
        print(f"  Total usuários  : {len(ADMINISTRATORS) + len(COORDINATORS) + len(COLLABORATORS)}")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
