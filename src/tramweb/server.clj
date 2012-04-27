(ns tramweb.server
  (:require [noir.server :as server]))

(server/load-views "src/tramweb/views/")

(defn -main [& m]
  (let [mode (keyword (or (first m) :dev))
        port (Integer. (get (System/getenv) "PORT" "3000"))]
    (server/start port {:mode mode
                        :ns 'tramweb})))

