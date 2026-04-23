# Guía de Presentación - Clase 16: PSM + IPW + Controles Sintéticos

## 📺 SLIDES A PRESENTAR

**En orden:**

1. **`Slides/clase16/PSM.pdf`** (20 minutos)
   - Problema fundamental (Rubin)
   - ATE vs ATT conceptos
   - Sesgo de selección
   - Soporte común (intuición)

2. **`Slides/slides_ipw_sinteticos.pdf`** (25 minutos)
   - IPW: intuición vs matching
   - Construcción de pesos
   - Synthetic Control (Prop 99 California)
   - Pre-tendencias & Placebo

3. **Comparación de métodos** (5 minutos)
   - Cuándo usar PSM vs IPW vs Synthetic Control
   - Trade-offs: sesgo-varianza

---

## 💻 DO-FILES PARA DEMOSTRACIÓN EN VIVO

### OPCIÓN 1: CON PAUSAS PARA EXPLICAR (Recomendado para clase)

**`01_psm_stata_CLASSROOM.do`** ← **USA ESTE**
- `set echo on` → Muestra todos los comandos
- Pause statements → Para entre secciones
- Explicaciones inline → Qué se está haciendo
- **Tiempo:** ~20 minutos

```stata
do "01_psm_stata_CLASSROOM.do"
```

**Flujo:**
1. Datos crudos (diferencia bruta)
   → PAUSE: "Esto incluye sesgo de selección"
   
2. Estimar propensity score
   → PAUSE: "¿Cómo se vería un buen modelo?"
   
3. Verificar soporte común
   → PAUSE: "¿Hay buena sobreposición?"
   
4. NN(1) sin reemplazo
   → PAUSE: "¿Cambió el resultado?"
   
5. NN(5) con reemplazo
   → PAUSE: "¿Más robusto?"
   
6. Kernel matching
   → PAUSE: "Compara este vs NN"
   
7. teffects psmatch
   → PAUSE: "Nota los SE"

---

### OPCIÓN 2: VERSIÓN RÁPIDA (Si tienes poco tiempo)

**`01_psm_stata.do`** (sin pausas)
- `set echo on` → Muestra comandos
- Ejecuta todo sin pausas
- **Tiempo:** ~10-15 minutos (más rápido)

```stata
do "01_psm_stata.do"
```

---

## 📊 FLOW RECOMENDADO PARA MAÑANA (60 minutos totales)

```
MINUTO  ACTIVIDAD
======  =========================================
0-20    SLIDES PSM.pdf
        ├─ Problema fundamental (Rubin)
        ├─ ATE vs ATT
        ├─ Sesgo de selección
        └─ Soporte común

20-30   LIVE DEMO: 01_psm_stata_CLASSROOM.do
        ├─ Muestra datos crudos
        ├─ Estimación de PS
        ├─ Verificación soporte
        └─ Emparejamiento (NN, Kernel)
        
        → Espera PAUSE → Discute resultados

30-50   SLIDES slides_ipw_sinteticos.pdf
        ├─ Alternativa a PSM: IPW
        ├─ Construcción de pesos
        ├─ Synthetic Control (caso Prop 99)
        └─ Pre-tendencias

50-60   LIVE DEMO: 02_ipw_stata.do (SHORT VERSION)
        ├─ Construcción de pesos
        ├─ Comparativa de métodos
        └─ Resumen: PSM vs IPW vs Synthetic
```

---

## ⚙️ COMANDOS NECESARIOS ANTES DE CLASE

Run this ONCE in Stata:
```stata
ssc install psmatch2
ssc install pstest
ssc install estout
```

---

## 📝 WHAT WILL BE DISPLAYED

### From `01_psm_stata_CLASSROOM.do`:

```
>>> PASO 1: MIRAR LOS DATOS CRUDOS
¿Cuántos tratados? ¿Cuántos controles? ¿Cuál es la diferencia bruta?

. tab D
        D |      Freq.     Percent        Cum.
-----------+-----------------------------------
        0 |      2,048       51.20       51.20
        1 |      1,952       48.80      100.00
-----------+-----------------------------------
    Total |      4,000      100.00

. table D, stat(mean y2 y1)

  D |      mean(y2)     mean(y1)
----+----------------------------
  0 |         -.977         -.661
  1 |         -.644         -.659

>>> OBSERVACIÓN: La diferencia cruda en Y2 es:
    Diferencia = E[Y|D=1] - E[Y|D=0] = 0.330 (aproximadamente)
    Pero esto NO es el efecto causal: incluye sesgo de selección

Press any key to continue...
```

**Then shows:**
- Logit estimation
- Propensity score distribution (graph)
- psmatch2 results for different algorithms
- pstest balance statistics
- Comparison of estimators

---

## 🎯 TALKING POINTS DURANTE DEMO

### When showing data:
*"Vemos que hay diferencia entre Y de tratados (−0.644) y controles (−0.977). ¿Es esto el efecto real? No, porque los tratados y controles son diferentes — hay sesgo de selección."*

### When showing PS:
*"El propensity score es la probabilidad predicha de ser tratado. Lo estimamos con logit. Luego lo usamos para emparejar: controlamos por observables."*

### When showing balance:
*"Después de emparejar, vemos si el balance mejoró. %Bias debería ser < 20%. Si no, el matching no funcionó bien."*

### When comparing methods:
*"NN es transparente pero descarta muestra. Kernel usa toda la muestra pero es menos transparente. IPW usa pesos en lugar de descartar. Todos deberían dar resultados similares si el modelo está bien especificado."*

### Final comparison:
*"¿Ves? Los estimadores son similares (~0.33) independientemente del método. Eso es buena señal: es robusto a la especificación."*

---

## 📁 FILES IN EjerciciosClase/

```
✅ 01_psm_stata_CLASSROOM.do    ← USA ESTE EN CLASE
✅ 01_psm_stata.do              (sin pausas, más rápido)
✅ 02_ipw_stata.do              (si hay tiempo)
✅ 03_synthetic_controls_stata.do (opcional)
✅ 00_quick_check.do            (verificación previa)
✅ base6.dta                    (4000 obs)
✅ synth_smoking.dta            (1170 obs)
```

---

## ⏱️ TIMING

- **PSM CLASSROOM:** 15-20 min (con pausas y explicaciones)
- **Mostrar gráficas:** 2-3 min
- **Discusión:** 5 min

**Total:** ~25-30 minutos de demo live

---

## 🚨 SI ALGO FALLA

### Error: "psmatch2 not found"
```stata
ssc install psmatch2
```

### Error: "variable not found"
```stata
use base6.dta, clear
desc
```

### If you want to skip to a specific section:
Edit do-file and comment out earlier sections (surround with /* */)

---

## ✅ FINAL CHECKLIST BEFORE CLASS

- [ ] Run `00_quick_check.do` to verify everything
- [ ] Install SSC packages (psmatch2, pstest, estout)
- [ ] Have `01_psm_stata_CLASSROOM.do` open and ready
- [ ] Have slides PDF open in separate window
- [ ] Test the pause statements in do-file
- [ ] Verify base6.dta and synth_smoking.dta are present

---

## 💡 PRO TIPS

1. **Pause before showing results:** Predict what students think will happen
2. **Show the log:** After demo, show `psm_classroom.log` to students
3. **Compare side-by-side:** Open PSM slides + do-file output together
4. **Ask questions:** "Why did NN(5) give almost the same result as NN(1)?"
5. **Save graphs:** All .png files go to EjerciciosClase/ automatically

---

*Last updated: 2026-04-22*
*Ready for tomorrow's class ✅*
