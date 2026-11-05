from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT

ROOT = Path('/Users/nicholasbeeson/aptis-grammar-tool')
OUT = ROOT / 'output/pdf/guia-curso-aptis-modular-y-taller-speaking.pdf'
FONT = Path('/System/Library/Fonts/Supplemental')
for name, filename in [('Sans','Arial.ttf'),('SansBold','Arial Bold.ttf'),('Serif','Georgia.ttf'),('SerifBold','Georgia Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONT / filename)))
pdfmetrics.registerFontFamily('Sans', normal='Sans', bold='SansBold', italic='Sans', boldItalic='SansBold')
W,H = 595.2756,841.8898
NAVY = HexColor('#142D3B')
INK = HexColor('#243D49')
MUTED = HexColor('#586A73')
ORANGE = HexColor('#E9AB61')
CREAM = HexColor('#F7F4EE')
LINE = HexColor('#DCE2E3')
TEAL = HexColor('#287B79')
M = 44
CW = W-2*M
c = canvas.Canvas(str(OUT), pagesize=(W,H))
c.setTitle('Preparación Aptis | Curso modular y taller de speaking')
c.setAuthor('Seif English Academy')
c.setSubject('Guía para alumnos: matrícula continua, rotación W/R/S/L, taller de speaking e integración de la plataforma')

def rect(x,y,w,h,color,r=0):
    c.setFillColor(color)
    if r: c.roundRect(x,H-y-h,w,h,r,stroke=0,fill=1)
    else: c.rect(x,H-y-h,w,h,stroke=0,fill=1)

def line(x,y,x2,y2,color=LINE,width=0.7):
    c.setStrokeColor(color); c.setLineWidth(width); c.line(x,H-y,x2,H-y2)

def text(txt,x,y,size=10,font='Sans',color=INK):
    c.setFillColor(color); c.setFont(font,size); c.drawString(x,H-y-size,txt)

def para(txt,x,y,w,size=10.3,leading=15,color=INK,font='Sans',limit=None):
    p=Paragraph(txt,ParagraphStyle('body',fontName=font,fontSize=size,leading=leading,textColor=color,alignment=TA_LEFT,spaceAfter=0))
    _,h=p.wrap(w,1000)
    if limit is not None and h>limit: raise ValueError(f'Overflow {h}>{limit}: {txt[:80]}')
    p.drawOn(c,x,H-y-h)
    return h

def label(txt,x,y,color=TEAL):
    text(txt.upper(),x,y,8.3,'SansBold',color)

def footer(n,topic):
    line(M,793,W-M,793)
    text('SEIF ENGLISH ACADEMY  /  PREPARACIÓN APTIS',M,807,7.2,'SansBold',MUTED)
    c.setFont('Sans',7.5);c.setFillColor(MUTED);c.drawRightString(W-M,H-815,f'{topic}   /   {n:02d}')

def header(n,kicker,title,desc):
    rect(0,0,W,8,NAVY)
    label('SEIF  /  GUÍA DEL CURSO',M,34,MUTED)
    text(f'0{n}',W-M-27,28,25,'Serif',TEAL)
    label(kicker,M,77)
    para(title,M,99,CW,27,32,NAVY,'Serif',70)
    para(desc,M,147,CW,11,16,MUTED,limit=50)

# 1. The model and the enrolment journey.
rect(0,0,W,278,NAVY)
c.drawImage(str(ROOT/'public/images/seif-aptis-trainer-logo.png'),M, H-119,155,80,mask='auto',preserveAspectRatio=True,anchor='nw')
label('GUÍA DEL CURSO',M,139,ORANGE)
para('Un curso flexible.<br/>Una preparación completa.',M,161,CW,30,36,white,'Serif',80)
text('Curso modular + taller de speaking de 4 semanas',M,246,11,'Sans',HexColor('#E3E9E9'))
label('01  /  CÓMO FUNCIONA',M,307)
para('Puedes incorporarte al módulo en marcha y continuar con la rotación semanal. Cada semana tiene una destreza principal; la gramática y el vocabulario se refuerzan periódicamente a lo largo del ciclo.',M,330,CW,11,16,limit=64)

cycle=[('W','Writing','Expresión escrita'),('R','Reading','Comprensión lectora'),('S','Speaking','Expresión oral'),('L','Listening','Comprensión auditiva')]
gap=14; card=(CW-3*gap)/4
for i,(letter,title,sub) in enumerate(cycle):
    x=M+i*(card+gap)
    rect(x,415,card,109,CREAM,7)
    text(letter,x+12,425,27,'Serif',TEAL)
    text(title,x+12,464,11,'SansBold',NAVY)
    para(sub,x+12,484,card-24,8.5,12,MUTED,limit=28)
    if i<3:
        text('>',x+card+3,456,11,'SansBold',TEAL)
line(M+5,540,W-M-5,540,TEAL)
text('El ciclo vuelve a Writing y continúa.',M,550,9,'Sans',TEAL)

label('MATRÍCULA CONTINUA, RECORRIDO PERSONAL',M,589)
steps=[('01','Te incorporas','Empiezas con el foco de la semana y sus materiales de apoyo.'),('02','Completas la rotación','Pasas por las cuatro destrezas desde tu punto de entrada.'),('03','Sigues avanzando','Retomas cada destreza con más práctica y objetivos de mejora.')]
for i,(num,title,body) in enumerate(steps):
    y=613+i*45
    text(num,M,y,12,'Serif',TEAL)
    text(title,M+34,y,10.3,'SansBold')
    para(body,M+34,y+16,CW-34,9.3,13,MUTED,limit=26)
rect(M,752,CW,25,CREAM,4)
para('Las cuatro semanas describen una rotación; la duración total depende de tu recorrido.',M+10,758,CW-20,8.7,12,limit=14)
footer(1,'El modelo')
c.showPage()

# 2. Modules and periodic language work.
header(2,'02  /  EL CURSO MODULAR','Una destreza protagonista cada semana','Un foco claro para trabajar estrategias, aplicarlas en tareas y revisar cómo mejorar tus respuestas.')
modules=[
 ('W','Writing · Expresión escrita','Responder con claridad, organizar las ideas y adaptar el registro.','Respuestas breves, mensajes y correos formales e informales.','Conectores, tiempos verbales y expresiones útiles para escribir.'),
 ('R','Reading · Comprensión lectora','Identificar ideas principales, detalles y relaciones entre frases.','Textos breves, ordenación de frases y asociación de opiniones y títulos.','Paráfrasis, familias de palabras y referencias dentro del texto.'),
 ('S','Speaking · Expresión oral','Ampliar las respuestas, describir, comparar y expresar opiniones.','Preguntas personales, fotografías e intervenciones más extensas.','Lenguaje descriptivo, comparativos y recursos para justificar ideas.'),
 ('L','Listening · Comprensión auditiva','Captar información clave, intención y puntos de vista al escuchar.','Audios y preguntas de comprensión, con revisión de las respuestas.','Vocabulario en contexto, expresiones frecuentes y reconocimiento de formas orales.'),
]
for i,(letter,title,obj,practice,language) in enumerate(modules):
    y=214+i*102
    rect(M,y,38,38,NAVY,5)
    text(letter,M+9,y+4,23,'Serif',white)
    x=M+54
    text(title,x,y-1,12,'SansBold',NAVY)
    para(obj,x,y+20,CW-54,10,14,limit=29)
    para('<b>Práctica:</b> '+practice,x,y+49,CW-54,9.2,13,MUTED,limit=27)
    para('<b>Refuerzo:</b> '+language,x,y+77,CW-54,8.8,12,TEAL,limit=25)
    if i<3: line(M,y+100,W-M,y+100)

rect(M,653,CW,117,CREAM,7)
label('GRAMÁTICA Y VOCABULARIO A LO LARGO DEL CICLO',M+17,669)
para('Se dedican momentos específicos al repaso y a la práctica de los contenidos que ayudan en cada destreza: estructuras, colocaciones, precisión y errores frecuentes.',M+17,690,CW-34,10.2,15,limit=45)
para('Los ejemplos de refuerzo son orientativos y se ajustan a las necesidades del grupo.',M+17,742,CW-34,8.8,12,MUTED,limit=15)
footer(2,'Los módulos')
c.showPage()

# 3. Four-week speaking workshop, grounded in the existing topic rotation.
header(3,'03  /  TALLER DE SPEAKING','Cuatro semanas para hablar más','Un ciclo temático que complementa el curso modular y ofrece más oportunidades de práctica oral, preparación y revisión.')
label('4 SEMANAS  /  8 TEMAS',M,208)
weeks=[
 ('01','Relaciones y familia','Viajes y transporte','Hablar de personas, experiencias y preferencias.'),
 ('02','Hogar y entorno','Tecnología y comunicación','Describir lugares, comparar opciones y comentar hábitos.'),
 ('03','Alimentación','Educación y aprendizaje','Explicar rutinas, relatar experiencias y dar razones.'),
 ('04','Deporte y ocio','Trabajo y profesiones','Desarrollar opiniones y valorar ventajas e inconvenientes.'),
]
for i,(num,t1,t2,goal) in enumerate(weeks):
    y=233+i*82
    rect(M,y,CW,73,CREAM if i%2==0 else HexColor('#F0F5F4'),6)
    text(num,M+13,y+10,25,'Serif',TEAL)
    text('SEMANA',M+11,y+43,6.6,'SansBold',MUTED)
    text(t1+'  /  '+t2,M+79,y+12,10.4,'SansBold',NAVY)
    para(goal,M+79,y+36,CW-96,9.7,14,MUTED,limit=29)

label('LAS CUATRO PARTES DEL SPEAKING',M,583)
para('Los temas sirven de base para trabajar preguntas personales, descripción de una fotografía, comparación de imágenes y una intervención más extensa. El foco temático cambia cada semana; las destrezas se retoman a lo largo del taller.',M,605,CW,10.4,15,limit=60)

line(M,682,W-M,682)
for i,(title,body) in enumerate([
 ('Preparar','Activar vocabulario e ideas con los materiales del tema.'),
 ('Practicar','Hablar con apoyo y avanzar hacia tareas cronometradas.'),
 ('Mejorar','Revisar la respuesta y volver a intentarlo con un objetivo claro.'),
]):
    x=M+i*(CW+18)/3
    text(title,x,701,11,'SansBold',TEAL)
    para(body,x,724,(CW-36)/3,9.4,13.5,MUTED,limit=43)
footer(3,'El taller')
c.showPage()

# 4. The platform and practical materials.
header(4,'04  /  PLATAFORMA Y MATERIALES','La práctica continúa entre clases','La plataforma conecta el trabajo de clase con la preparación individual, el repaso y la práctica con formato de examen.')

gap=13; col=(CW-gap*2)/3
for i,(num,title,body) in enumerate([
 ('01','Antes de clase','Consulta el material del módulo o del taller. Revisa las estrategias y activa el vocabulario que vas a utilizar.'),
 ('02','Durante la clase','Aplica lo preparado en actividades guiadas. Practica con textos, audios, imágenes y tareas de producción.'),
 ('03','Después de clase','Retoma las tareas, consulta las explicaciones o los comentarios disponibles y refuerza los puntos que necesites.'),
]):
    x=M+i*(col+gap)
    rect(x,215,col,165,CREAM,7)
    text(num,x+13,228,20,'Serif',TEAL)
    text(title,x+13,261,11,'SansBold',NAVY)
    para(body,x+13,286,col-26,9.7,14,limit=83)

label('RECURSOS PARA UNA PRÁCTICA CON PROPÓSITO',M,410)
materials=[
 ('Guías y dossier del curso','Estrategias por destreza, explicaciones y material de consulta.'),
 ('Actividades de gramática y vocabulario','Ejercicios para consolidar estructuras y ampliar recursos expresivos.'),
 ('Textos, audios y tareas de examen','Práctica por partes y simulacros para familiarizarte con el formato.'),
 ('Materiales del taller de speaking','Preparación temática, fotografías, preguntas y recursos de expresión.'),
 ('Producción y revisión','Respuestas escritas y grabaciones orales para detectar mejoras y repetir la tarea.'),
]
for i,(title,body) in enumerate(materials):
    y=438+i*44
    rect(M,y+5,4,4,ORANGE)
    text(title,M+16,y,10,'SansBold',NAVY)
    para(body,M+16,y+17,CW-16,9.1,13,MUTED,limit=26)
    if i<4: line(M+16,y+39,W-M,y+39)

para('Los recursos y las funciones de práctica se habilitan según el módulo, la actividad y la sesión del taller.',M,672,CW,8.6,12,MUTED,limit=26)
rect(M,718,CW,59,NAVY,6)
para('Un recorrido conectado',M+17,728,CW-34,16,21,white,'Serif',24)
para('Clase para aprender. Plataforma para practicar. Revisión para avanzar.',M+17,755,CW-34,9.3,13,HexColor('#E3E9E9'),limit=15)
footer(4,'La práctica')
c.save()
print(OUT)
