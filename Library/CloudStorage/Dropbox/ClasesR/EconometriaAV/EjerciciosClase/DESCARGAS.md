# Descargas - Clase 16: PSM, IPW y Controles Sintéticos

## 📥 Descargar Archivos Individuales

### Do-files de Stata

1. **01_psm_stata_CLASSROOM.do** (Recomendado para clase)
   - Propensity Score Matching con pauses para explicación
   - [Descargar](https://raw.githubusercontent.com/adiazescobar/adiazescobar.github.io/main/EjerciciosClase/01_psm_stata_CLASSROOM.do)

2. **01_psm_stata.do** (Versión rápida)
   - PSM sin pausas
   - [Descargar](https://raw.githubusercontent.com/adiazescobar/adiazescobar.github.io/main/EjerciciosClase/01_psm_stata.do)

3. **02_ipw_stata.do**
   - Inverse Probability Weighting completo
   - [Descargar](https://raw.githubusercontent.com/adiazescobar/adiazescobar.github.io/main/EjerciciosClase/02_ipw_stata.do)

4. **03_synthetic_controls_stata.do**
   - Synthetic Control Method con caso Prop 99
   - [Descargar](https://raw.githubusercontent.com/adiazescobar/adiazescobar.github.io/main/EjerciciosClase/03_synthetic_controls_stata.do)

5. **00_quick_check.do**
   - Verificación rápida antes de usar los do-files
   - [Descargar](https://raw.githubusercontent.com/adiazescobar/adiazescobar.github.io/main/EjerciciosClase/00_quick_check.do)

### Bases de Datos

- **base6.dta** (4,000 observaciones)
  - Usada para PSM e IPW
  - [Descargar](https://github.com/adiazescobar/adiazescobar.github.io/raw/main/EjerciciosClase/base6.dta)

- **synth_smoking.dta** (1,170 observaciones)
  - Caso Prop 99 - Consumo de cigarrillos en California
  - [Descargar](https://github.com/adiazescobar/adiazescobar.github.io/raw/main/EjerciciosClase/synth_smoking.dta)

### Script de Python

- **04_psm_ipw_python.py**
  - Demostración en Python (dataset simulado)
  - [Descargar](https://raw.githubusercontent.com/adiazescobar/adiazescobar.github.io/main/EjerciciosClase/04_psm_ipw_python.py)

### Documentación

- **README.md** - Instrucciones de uso
  - [Descargar](https://raw.githubusercontent.com/adiazescobar/adiazescobar.github.io/main/EjerciciosClase/README.md)

- **CLASS_PRESENTATION_GUIDE.md** - Guía para presentación en clase
  - [Descargar](https://raw.githubusercontent.com/adiazescobar/adiazescobar.github.io/main/EjerciciosClase/CLASS_PRESENTATION_GUIDE.md)

- **VALIDATION_REPORT.md** - Reporte de verificación
  - [Descargar](https://raw.githubusercontent.com/adiazescobar/adiazescobar.github.io/main/EjerciciosClase/VALIDATION_REPORT.md)

---

## 📦 Descargar Todo de Una Vez

### Opción 1: Git (Recomendado)

```bash
# Clonar el repositorio completo
git clone https://github.com/adiazescobar/adiazescobar.github.io.git

# Navegar a la carpeta de ejercicios
cd adiazescobar.github.io/EjerciciosClase

# Ejecutar en Stata
do "00_quick_check.do"
do "01_psm_stata_CLASSROOM.do"
```

### Opción 2: Descargar como ZIP

1. Ir a: https://github.com/adiazescobar/adiazescobar.github.io
2. Click en **Code** → **Download ZIP**
3. Descomprimir
4. Navegar a carpeta `EjerciciosClase/`
5. Abrir archivos en Stata

### Opción 3: Descargar archivos individuales

Usa los links de descarga directa en la sección anterior.

---

## 🚀 Pasos Después de Descargar

### En Stata:

```stata
* 1. Cambiar al directorio donde descargaste los archivos
cd "C:/Users/TuNombre/Descargas/EjerciciosClase"  * Windows
* o
cd ~/Desktop/EjerciciosClase  * Mac/Linux

* 2. Verificar que todo está listo
do "00_quick_check.do"

* 3. Ejecutar el do-file principal
do "01_psm_stata_CLASSROOM.do"
```

### En Python:

```bash
# Asegúrate de tener las librerías instaladas
pip install numpy pandas scikit-learn matplotlib seaborn statsmodels

# Ejecutar el script
python 04_psm_ipw_python.py
```

---

## ❓ Preguntas Frecuentes

**P: ¿Necesito descargar los do-files?**
R: Sí, necesitas los do-files (*.do) para trabajar en Stata.

**P: ¿Necesito descargar las bases de datos?**
R: Sí, los do-files cargan base6.dta y synth_smoking.dta. Deben estar en el mismo directorio.

**P: ¿Qué versión de Stata necesito?**
R: Stata 13+ (para teffects). Los comandos psmatch2 e ipw funcionan en versiones anteriores.

**P: ¿Puedo usar solo Python sin Stata?**
R: Sí, 04_psm_ipw_python.py es independiente y crea su propio dataset.

**P: ¿Dónde guardo los archivos?**
R: Todos en la misma carpeta (EjerciciosClase/). Los do-files buscan datos en el mismo directorio.

---

## 📚 Material Complementario

**Clase Teórica (Rmd):**
https://github.com/adiazescobar/libro_cortes/blob/main/16-PSM_IPW_SinteticosConsolidado.Rmd

**Slides PSM:**
(disponibles en Dropbox/ClasesR/EconometriaAV/Slides/)
- PSM.pdf
- slides_ipw_sinteticos.pdf
- PSM_Stata.pdf

---

**¿Problemas al descargar?**
Contacta a: a.diaze@javeriana.edu.co

*Última actualización: 2026-04-22*
