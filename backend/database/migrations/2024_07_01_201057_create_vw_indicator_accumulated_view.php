<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;


class CreateVwIndicatorAccumulatedView extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("
        CREATE OR REPLACE VIEW vw_indicator_accumulated AS
SELECT
    s.service_name AS nome_do_servico,
    a.activity_name AS nome_da_atividade,
    i.indicator_name AS nome_do_indicador,
    i.id AS indicator_id,
    r.value AS valor_mensal,
    r.date AS data,
    sai.service_id,
    sai.activity_id,
    EXTRACT(YEAR FROM r.date) AS year,
    EXTRACT(MONTH FROM r.date) AS month,
    SUM(r2.value) OVER (PARTITION BY r.sai_id, EXTRACT(YEAR FROM r.date) ORDER BY r.date) AS valor_acumulado_agregado
FROM records r
JOIN sais sai ON r.sai_id = sai.id
JOIN indicators i ON sai.indicator_id = i.id
JOIN services s ON sai.service_id = s.id
LEFT JOIN activities a ON sai.activity_id = a.id
LEFT JOIN records r2 ON r.sai_id = r2.sai_id AND r2.date <= r.date
");

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement("DROP VIEW IF EXISTS vw_indicator_accumulated");
    }
}