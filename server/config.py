class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql://root:<ur_pw>@localhost/student_admission'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size