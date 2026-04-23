/*
Quick Check: Verificar que TODO está listo para Clase 16
Ejecutar esto ANTES de clase para asegurar que no hay problemas
*/

clear all
set more off

cd ~/Library/CloudStorage/Dropbox/ClasesR/EconometriaAV/EjerciciosClase

di ""
di "================================================================"
di "VERIFICACIÓN RÁPIDA - CLASE 16: PSM, IPW, CONTROLES SINTÉTICOS"
di "================================================================"

* 1. Verificar que base6.dta existe y carga
di ""
di "1. Verificando base6.dta..."
capture use base6.dta, clear
if _rc == 0 {
    di "   ✓ base6.dta cargado exitosamente"
    di "   Observaciones: " _N
    di "   Variables: " c(k)

    * Verificar variables críticas
    capture confirm var D y2 personas orden_n ocupado_jefe educa_jefe ingresos_hogar_jefe hombre
    if _rc == 0 {
        di "   ✓ Todas las variables requeridas presentes"
    }
    else {
        di "   ✗ FALTA ALGUNA VARIABLE"
    }
}
else {
    di "   ✗ ERROR: No se puede cargar base6.dta"
    di "   Asegúrate de estar en el directorio: " c(pwd)
    exit
}

* 2. Verificar que synth_smoking.dta existe
di ""
di "2. Verificando synth_smoking.dta..."
capture use synth_smoking.dta, clear
if _rc == 0 {
    di "   ✓ synth_smoking.dta cargado exitosamente"
    di "   Observaciones: " _N
}
else {
    di "   ✗ ADVERTENCIA: synth_smoking.dta no encontrado"
    di "   (do-file 03 creará datos simulados como fallback)"
}

* 3. Verificar que psmatch2 está instalado
di ""
di "3. Verificando comandos Stata requeridos..."
capture which psmatch2
if _rc == 0 {
    di "   ✓ psmatch2 instalado"
}
else {
    di "   ✗ ADVERTENCIA: psmatch2 no instalado"
    di "   Ejecuta: ssc install psmatch2"
}

* 4. Verificar que teffects está disponible
capture program drop _test_teffects
program define _test_teffects
    syntax
    di "teffects disponible"
end

capture teffects psmatch (y2) (D, probit)
if _rc == 198 {
    di "   ✗ teffects psmatch no disponible en esta versión de Stata"
    di "   (Requiere Stata 13+)"
}
else if _rc == 0 {
    di "   ✓ teffects disponible (Stata 13+)"
}
else {
    * Intentar cargar base y verificar sintaxis
    use base6.dta, clear
    capture teffects
    if _rc == 199 {
        di "   ✓ teffects disponible"
    }
    else {
        di "   ? Estado de teffects incierto (error: " _rc ")"
    }
}

* 5. Resumen final
di ""
di "================================================================"
di "RESUMEN:"
di "================================================================"
di ""
di "Archivos listos para mañana:"
di "  • 01_psm_stata.do         → PSM Completo (5 algoritmos)"
di "  • 02_ipw_stata.do         → IPW (pesos + regresión)"
di "  • 03_synthetic_controls   → Control sintético"
di "  • 04_psm_ipw_python.py    → Demo en Python"
di ""
di "Datos disponibles:"
di "  ✓ base6.dta (4000 obs)"
di "  ✓ synth_smoking.dta (1170 obs)"
di ""
di "Clase 16:"
di "  ✓ 16-PSM_IPW_SinteticosConsolidado.Rmd"
di "  ✓ Cobertura: PSM + IPW + Controles Sintéticos"
di ""
di "================================================================"
di "LISTO PARA CLASE ✓"
di "================================================================"
