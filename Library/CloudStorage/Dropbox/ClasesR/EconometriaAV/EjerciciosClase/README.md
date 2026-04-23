# Ejercicios Clase 16: PSM, IPW y Controles Sintéticos

## Archivos Incluidos

### Do-files de Stata

1. **01_psm_stata.do**
   - Propensity Score Matching completo
   - Métodos: NN, Kernel, Caliper, Radio, LLR
   - Datos: base6.dta
   - Errores estándar: bootstrap, Abadie-Imbens
   - Comando alternativo: teffects psmatch

2. **02_ipw_stata.do**
   - Inverse Probability Weighting
   - Construcción de pesos: ATT y ATE
   - Regresión ponderada
   - Análisis de sensibilidad a pesos extremos
   - Verificación de balance
   - Datos: base6.dta
   - Comando: teffects ipw

3. **03_synthetic_controls_stata.do**
   - Synthetic Control Method
   - Caso: Prop 99 de California (impuesto al tabaco, 1988)
   - Datos: synth_smoking.dta
   - Análisis de pre-tendencias
   - Prueba placebo
   - Cálculo de efectos acumulados

### Script de Python

4. **04_psm_ipw_python.py**
   - Implementación de PSM, IPW y Synthetic Control en Python
   - Dataset simulado (1000 observaciones)
   - Estimación de propensity score
   - Matching NN(1)
   - Construcción de pesos IPW
   - Synthetic control simulado
   - Gráficas comparativas
   
   **Requisitos:**
   ```bash
   pip install numpy pandas scikit-learn matplotlib seaborn statsmodels
   ```
   
   **Ejecución:**
   ```bash
   python 04_psm_ipw_python.py
   ```

### Bases de Datos

- **PSM.xlsx** — Base de datos para ejercicios PSM e IPW (1000+ obs)
- **synth_smoking.dta** — Consumo de cigarrillos per capita en EE.UU., 1970-2000 (39 estados)

## Cómo Ejecutar

### Stata
```stata
cd ~/Library/CloudStorage/Dropbox/ClasesR/EconometriaAV/EjerciciosClase
do "01_psm_stata.do"
do "02_ipw_stata.do"
do "03_synthetic_controls_stata.do"
```

### Python
```bash
cd ~/Library/CloudStorage/Dropbox/ClasesR/EconometriaAV/EjerciciosClase
python 04_psm_ipw_python.py
```

## Salida Esperada

### Stata
- Logs de ejecución: `psm_demo.log`, `ipw_demo.log`, `synthetic_controls_demo.log`
- Gráficas: archivos .png con distribuciones, balance, efectos

### Python
- Gráficas de soporte común, pesos IPW, y control sintético
- Estadísticas de efectos estimados

## Conceptos Clave

| Método | Cuándo Usar | Fortalezas | Debilidades |
|--------|------------|-----------|------------|
| **PSM** | Muchas observaciones, buen soporte común | Transparente, intuitivo | Descarta muestras, sesgo de matching |
| **IPW** | Buen soporte común, quieres usar toda la muestra | Eficiente, flexible | Pesos extremos, sensibilidad a PS |
| **Synthetic** | Una sola unidad tratada ($N_T=1$) | Método para casos únicos | Requiere muchos pre-períodos |

## Supuestos Críticos

1. **Conditional Independence Assumption (CIA):** $\{Y(1), Y(0)\} \perp D \mid X$
2. **Soporte Común:** $0 < P(D=1\mid X) < 1$
3. **Sin variables no observadas relevantes** (limitación fundamental)

## Lecturas Recomendadas

- Caliendo & Kopeinig (2008) — "Some practical guidance for the implementation of propensity score matching"
- Abadie & Imbens (2006) — "Large sample properties of matching estimators for average treatment effects"
- Abadie, Diamond & Hainmueller (2010) — "Synthetic Control Methods for Comparative Case Studies"

## Preguntas Comunes

**P: ¿Cuál método debo usar?**
R: Depende de tu pregunta y datos:
- Si tienes una sola unidad tratada → Synthetic Control
- Si tienes muchas observaciones y buen soporte → PSM o IPW (IPW es más eficiente)
- Si tienes poca información y quieres robustez → combina múltiples métodos

**P: ¿Qué hago con pesos IPW extremos?**
R: Tres opciones: (1) Trim observaciones fuera de [0.1, 0.9], (2) Cap pesos en un máximo (ej: 5), (3) Normaliza ("stabilized IPW")

**P: ¿Cómo verifico que mi matching fue exitoso?**
R: Verifica balance con `pstest` o mira si %Bias < 20% para todas las covariables. El Pseudo R² debe ser bajo (< 5%).

---

*Última actualización: Clase 16 - EconometriaAV 2026-1*
