import exceljs from 'exceljs';
import moment from 'moment';

const { Workbook } = exceljs;

export const xlsxToJson = async (file) => processXlsx(file);

export const csvToJson = async (file) => processCsv(file);

const processXlsx = async (file) => {
    try {
        const workbook = new Workbook();
        await workbook.xlsx.readFile(file);
        const worksheet = workbook.getWorksheet(1);
        return processData(worksheet);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const processCsv = async (file) => {
    try {
        const workbook = new Workbook();
        const worksheet = await workbook.csv.readFile(file);
        return processData(worksheet);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const processData = (worksheet) => {
    try {
        const columns = getColumns(worksheet);
        const collection = [];

        for (let i = 2; i <= worksheet.actualRowCount; i++) {
            const row = worksheet.getRow(i).values.slice(1);
            const record = createRecord(row, columns, i);
            collection.push(record);
        }

        return collection;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const getColumns = (worksheet) => {
    const columns = worksheet.getRow(1).values;
    columns[0] = 'ID';
    return columns;
};

const createRecord = (row, columns, rowNum) => {
    const record = { ID: rowNum - 1 };
    for (let i = 1; i < columns.length; i++) {
        const columnName = removeAccents(columns[i].replace(/ /g, '_')).toLowerCase();
        const cellValue = row[i - 1];
        record[columnName] = cellValue === undefined ? null : cellValue;
    }
    return record;
};

const removeAccents = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const groupDataBy = (data, dateField) => {
    const dataGroup = {};

    for (const item of data) {
        if (!item[dateField]) {
            continue;
        }

        const date = moment(item[dateField].slice(0, 10), item[dateField].includes('/') ? 'MM/DD/YY' : undefined);
        const year = date.year();
        const month = date.month() + 1;

        if (!isNaN(year)) {
            if (!dataGroup[year]) {
                dataGroup[year] = {};
            }

            if (!dataGroup[year][month]) {
                dataGroup[year][month] = [];
            }

            dataGroup[year][month].push(item);
        }
    }

    return dataGroup;
};

export const groupData = (data) => {
    const dadosPorDataInicio = groupDataBy(data, 'data_inicio');
    const dadosPorDataCancelamento = groupDataBy(data, 'data_cancelamento');
    const anos = new Set([...Object.keys(dadosPorDataInicio), ...Object.keys(dadosPorDataCancelamento)]);

    const result = {};

    let numeroUsuarios = 0;
    let valorAcumulado = 0;

    for (const ano of anos) {
        for (let mes = 1; mes <= 12; mes++) {
            const key = `${mes < 10 ? '0' + mes : mes}/${ano}`;
            const novos = dadosPorDataInicio[ano]?.[mes]?.length || 0;
            const cancelados = dadosPorDataCancelamento[ano]?.[mes]?.length || 0;

            numeroUsuarios += novos - cancelados;
            const ativos = numeroUsuarios;

            const valorNovos = novos > 0 ? dadosPorDataInicio[ano][mes].reduce((acc, item) => acc + item.valor, 0) : 0;
            const valorCancelados = cancelados > 0 ? dadosPorDataCancelamento[ano][mes].reduce((acc, item) => acc + item.valor, 0) : 0;

            valorAcumulado += valorNovos - valorCancelados;

            result[key] = {
                novos,
                cancelados,
                ativos,
                valor_novos: +valorNovos.toFixed(2),
                valor_cancelados: +valorCancelados.toFixed(2),
                valor_acumulado: +valorAcumulado.toFixed(2),
            };
        }
    }

    return result;
};
