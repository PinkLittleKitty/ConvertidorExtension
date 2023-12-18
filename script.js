document.addEventListener('DOMContentLoaded', function () {
    const convertirButton = document.getElementById('convertirButton');
    const calcularButton = document.getElementById('calcularButton');

    if (convertirButton) {
        convertirButton.addEventListener('click', function () {
            convertir();
        });
    }

    if (calcularButton) {
        calcularButton.addEventListener('click', function () {
            calcular();
        });
    }

    chrome.runtime.getManifest().version;

    const extensionVersionElement = document.getElementById('extensionVersion');
    if (extensionVersionElement) {
        extensionVersionElement.textContent = chrome.runtime.getManifest().version;
    }
});

function convertir() { 
    const inputField = document.getElementById('inputField').value; 
    const inputType = document.getElementById('inputType').value;
    bitSize = Math.ceil(Math.log2(Math.abs(parseInt(inputField, 10))) + 1);
    document.getElementById('inputFieldBits').value = bitSize;

    // Limpiar los resultados previos 
    limpiarConversiones();

    // Realizar las conversiones basadas en el tipo de entrada 
    switch (inputType) { 
        case 'hex': 
            mostrarConversion('hexToBinary', parseInt(inputField, 16).toString(2), 'Hexadecimal a Binario'); 
            mostrarConversion('hexToDecimal', parseInt(inputField, 16).toString(10), 'Hexadecimal a Decimal'); 
            break; 
        case 'binary': 
            mostrarConversion('binaryToHex', parseInt(inputField, 2).toString(16).toUpperCase(), 'Binario a Hexadecimal'); 
            mostrarConversion('binaryToDecimal', parseInt(inputField, 2).toString(10), 'Binario a Decimal'); 
            break; 
        case 'decimal': 
            mostrarConversion('decimalToBinary', parseInt(inputField, 10).toString(2), 'Decimal a Binario'); 
            mostrarConversion('decimalToHex', parseInt(inputField, 10).toString(16).toUpperCase(), 'Decimal a Hexadecimal'); 
            break;
        case 'sm':
            const smValueD = decimalToSM(parseInt(inputField, 10), bitSize);
            mostrarConversion('smToDecimal', smValueD, 'Decimal a Signo-Magnitud (SM)');
            break;
        case 'ca2':
            const ca2ValueD = decimalToCA2(parseInt(inputField, 10), bitSize);
            console.log('Debug: ca2ValueD', ca2ValueD);
            mostrarConversion('ca2ToDecimal', ca2ValueD, 'Decimal a Complemento a 2 (CA2)');
            break;

        default: 
            // Tipo de entrada no válido 
            console.log('Tipo de entrada no válido'); 
    } 
}

function limpiarConversiones() {
    const conversionIds = ['hexToBinary', 'hexToDecimal', 'binaryToHex', 'binaryToDecimal', 'decimalToBinary', 'decimalToHex', 'ca2ToDecimal', 'smToDecimal'];

    conversionIds.forEach(id => {
        const elemento = document.getElementById(id);
        elemento.textContent = '';
    });
}

function mostrarConversion(id, resultado, etiqueta) {
    const elemento = document.getElementById(id);
    if (!isNaN(resultado)) {
        elemento.textContent = `${etiqueta}: ${resultado}`;
    } else {
        elemento.textContent = `${etiqueta}: Valor no válido`;
    }
}

function calcularRepresentacion() {
    const representationType = document.getElementById('representationType').value;
    const representationNumber = document.getElementById('representationNumber').value;

    // Limpiar resultados previos
    limpiarResultadosRepresentacion();

    if (!isNaN(representationNumber) && parseInt(representationNumber) >= 1) {
    let representationMax, representationMin;

    switch (representationType) {
        case 'bss':
            representationMax = Math.pow(2, parseInt(representationNumber)) - 1;
            representationMin = 0;
            break;
        case 'sm':
            representationMax = Math.pow(2, parseInt(representationNumber) - 1) - 1;
            representationMin = -Math.pow(2, parseInt(representationNumber) - 1) + 1;
            break;
        case 'ca2':
            representationMax = Math.pow(2, parseInt(representationNumber) - 1) - 1;
            representationMin = -Math.pow(2, parseInt(representationNumber) - 1);
            break;
        case 'fixedPoint':
            const bits = parseInt(representationNumber);
            const fractionalBits = bits / 2;
            representationMax = Math.pow(2, fractionalBits) - 1;
            representationMin = -Math.pow(2, fractionalBits);
            break;
        case 'excess':
            const excessValue = parseInt(representationNumber);
            representationMax = Math.pow(2, excessValue) - 1;
            representationMin = -Math.pow(2, excessValue);
            break;
        default:
            mostrarResultadoRepresentacion('Representación no válida');
            return;
    }
    mostrarResultadoRepresentacion(representationMax, representationMin);
    }else {
        mostrarResultadoRepresentacion("Número no válido");
    }
}

function limpiarResultadosRepresentacion() 
{
    const representationMax = document.getElementById('representationMax');
    const representationMin = document.getElementById('representationMin');

    representationMax.textContent = '';
    representationMin.textContent = '';
}

function mostrarResultadoRepresentacion(max, min) {
    const representationMax = document.getElementById('representationMax');
    const representationMin = document.getElementById('representationMin');

    representationMax.textContent = `Máximo: ${max}`;
    representationMin.textContent = `Mínimo: ${min}`;
}

function calcular() { 
    const calcInput1 = document.getElementById('calcInput1').value;
    const calcInputType1 = document.getElementById('calcInputType1').value;
    const calcOperator = document.getElementById('calcOperator').value;
    const calcInput2 = document.getElementById('calcInput2').value;
    const calcInputType2 = document.getElementById('calcInputType2').value;

    // Limpiar el resultado de cálculo anterior
    limpiarResultadoCalculo();

    // Convertir los valores de entrada a decimales
    const valor1 = convertirADecimal(calcInput1, calcInputType1);
    const valor2 = convertirADecimal(calcInput2, calcInputType2);

    if (!isNaN(valor1) && !isNaN(valor2)) {
        let resultado;
        switch (calcOperator) {
            case 'add':
                resultado = valor1 + valor2;
                break;
            case 'subtract':
                resultado = valor1 - valor2;
                break;
            case 'multiply':
                resultado = valor1 * valor2;
                break;
            case 'divide':
                if (valor2 !== 0) {
                    resultado = valor1 / valor2;
                } else {
                    mostrarResultadoCalculo('No se permite la división por cero');
                    return;
                }
                break;
            default:
                mostrarResultadoCalculo('Operador no válido');
                return;
        }

        mostrarResultadoCalculo(resultado);

        // Convertir el resultado a SM y CA2 y mostrarlos
        const resultSM = decimalToSM(resultado);
        const resultCA2 = decimalToCA2(resultado);

        mostrarResultadoSM(resultSM);
        mostrarResultadoCA2(resultCA2);
    } else {
        mostrarResultadoCalculo('Valores de entrada no válidos');
    }
}

function mostrarResultadoSM(resultSM) {
    const calcResultSM = document.getElementById('calcResultSM');
    if (!isNaN(resultSM)) {
        calcResultSM.textContent = `Resultado Signo-Magnitud (SM): ${resultSM}`;
    } else {
        calcResultSM.textContent = `Resultado Signo-Magnitud (SM): Valor no válido`;
    }
}

function mostrarResultadoCA2(resultCA2) {
    const calcResultCA2 = document.getElementById('calcResultCA2');
    if (!isNaN(resultCA2)) {
        calcResultCA2.textContent = `Resultado Complemento a 2 (CA2): ${resultCA2}`;
    } else {
        calcResultCA2.textContent = `Resultado Complemento a 2 (CA2): Valor no válido`;
    }
}

function decimalToSM(decimalValue, bitSize) {
    const isNegative = decimalValue < 0;
    const absoluteValue = Math.abs(decimalValue);
    const binaryRepresentation = absoluteValue.toString(2).padStart(bitSize - 1, '0');
    
    return (isNegative ? '1' : '0') + binaryRepresentation;
}

function decimalToCA2(decimalValue, bitSize) {
    const isNegative = decimalValue < 0;
    const absoluteValue = Math.abs(decimalValue);
    const invertedBinary = (Math.pow(2, bitSize) - absoluteValue).toString(2).padStart(bitSize, '0');

    if (isNegative) {
        return sumarUno(invertedBinary);
    } else {
        return invertedBinary;
    }
}



function mostrarResultadoCalculo(resultado) { 
    // Mostrar el resultado en Hexadecimal 
    const resultadoHex = resultado.toString(16).toUpperCase(); 
    const calcResultHex = document.getElementById('calcResultHex'); 
    calcResultHex.textContent = `Resultado Hexadecimal: 0x${resultadoHex}`; 

    // Mostrar el resultado en Binario 
    const resultadoBinary = resultado.toString(2); 
    const calcResultBinary = document.getElementById('calcResultBinary'); 
    calcResultBinary.textContent = `Resultado Binario: ${resultadoBinary}`; 

    // Mostrar el resultado en Decimal 
    const calcResultDecimal = document.getElementById('calcResultDecimal'); 
    calcResultDecimal.textContent = `Resultado Decimal: ${resultado}`; 
} 

function convertirADecimal(valor, tipo) {
    switch (tipo) {
        case 'hex':
            return parseInt(valor, 16);
        case 'binary':
            return parseInt(valor, 2);
        case 'decimal':
            return parseFloat(valor);
        case 'sm':
            const isNegative = valor.charAt(0) === '1';
            const absoluteValue = parseInt(valor.substr(1), 2);
            return isNegative ? -absoluteValue : absoluteValue;
        case 'ca2':
            const isNegativeCA2 = valor.charAt(0) === '1';
            const invertedCA2 = invertirBits(valor.substr(1));
            const absoluteValueCA2 = parseInt(invertedCA2, 2) + 1;
            return isNegativeCA2 ? -absoluteValueCA2 : absoluteValueCA2;
        default:
            return NaN;
    }
}

function invertirBits(binaryString) {
    return binaryString.split('').map(bit => (bit === '0' ? '1' : '0')).join('');
}

function sumarUno(binaryString) {
    const binaryArray = binaryString.split('').reverse();
    let carry = 1;
    for (let i = 0; i < binaryArray.length; i++) {
        const currentBit = binaryArray[i];
        if (carry === 0) break;

        if (currentBit === '0') {
            binaryArray[i] = '1';
            carry = 0;
        } else {
            binaryArray[i] = '0';
            carry = 1;
        }
    }

    return binaryArray.reverse().join('');
}

function mostrarConversion(id, resultado, etiqueta) {
    const elemento = document.getElementById(id);
    if (!isNaN(resultado)) {
        elemento.textContent = `${etiqueta}: ${resultado}`;
    }
}

function limpiarResultadoCalculo() { 
    const calcResultHex = document.getElementById('calcResultHex'); 
    const calcResultBinary = document.getElementById('calcResultBinary'); 
    const calcResultDecimal = document.getElementById('calcResultDecimal'); 

    calcResultHex.textContent = ''; 
    calcResultBinary.textContent = ''; 
    calcResultDecimal.textContent = ''; 
}