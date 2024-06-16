CREATE TABLE administrador (
    admin_id SERIAL PRIMARY KEY,
    admin_email VARCHAR(70) NOT NULL,
    admin_pass VARCHAR(200) NOT NULL,
    admin_escola VARCHAR(70) NOT NULL,
    admin_telefone VARCHAR(20) NOT NULL,
    admin_token VARCHAR(200)
);

CREATE Table aluno (
    aluno_id SERIAL PRIMARY KEY,
    aluno_nome VARCHAR(70) NOT NULL,
    aluno_email VARCHAR(70) NOT NULL,
    aluno_pass VARCHAR(200) NOT NULL,
    aluno_token VARCHAR(200),
    categoria_id INTEGER REFERENCES categoria(categoria_id) ON DELETE CASCADE ON UPDATE CASCADE,
    admin_id INTEGER REFERENCES administrador(admin_id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (aluno_email)
);

CREATE TABLE categoria (
    categoria_id SERIAL PRIMARY KEY,
    categoria_nome VARCHAR(70) NOT NULL,
    admin_id INTEGER REFERENCES administrador(admin_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE aula (
    aula_id SERIAL PRIMARY KEY,
    aula_data DATE NOT NULL,
    aula_horário TIME NOT NULL,
    aula_vagas INTEGER NOT NULL,
    aula_vagas_disponiveis INTEGER NOT NULL,
    aula_tipo ENUM('teoria', 'pratica') NOT NULL,
    categoria_id INTEGER REFERENCES categoria(categoria_id) ON DELETE CASCADE ON UPDATE CASCADE,
    admin_id INTEGER REFERENCES administrador(admin_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE Table inscricao (
    inscricao_id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES aluno(aluno_id) ON DELETE CASCADE ON UPDATE CASCADE,
    aula_id INTEGER REFERENCES aula(aula_id) ON DELETE CASCADE ON UPDATE CASCADE,
    inscricao_tempo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE progresso (
    progresso_id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES aluno(aluno_id) ON DELETE CASCADE ON UPDATE CASCADE,
    categoria_id INTEGER REFERENCES categoria(categoria_id) ON DELETE CASCADE ON UPDATE CASCADE,
    aula_id INTEGER REFERENCES aula(aula_id) ON DELETE CASCADE ON UPDATE CASCADE,
    progresso_status ENUM('agendado', 'completado') NOT NULL,
    progresso_tempo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


