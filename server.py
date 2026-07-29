from flask import Flask, render_template
import logging
import json
from datetime import datetime

# Убираем дубли
for handler in logging.root.handlers[:]:
    logging.root.removeHandler(handler)

# === Только chat.log ===
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    filename="chat.log",
    filemode='a',
    encoding='utf-8'
)

# В консоль
console = logging.StreamHandler()
console.setLevel(logging.INFO)
logging.getLogger('').addHandler(console)

logger = logging.getLogger('ChatServer')
logger.info("Сервер запущен — все логи в chat.log")

app = Flask(__name__)

@app.route('/')
def index():
    return render_template("ttt.html")


@app.route('/trigger/<string:type1>')
def trigger(type1):
    msgs = {
        "info": logger.info,
        "warning": logger.warning,
        "error": logger.error,
        "critical": logger.critical,
        "debug": logger.debug,
    }
    msgs[type1](f"Test: {type1}")
    return f"Test: {type1}"

app.run(host="0.0.0.0",port=1212)